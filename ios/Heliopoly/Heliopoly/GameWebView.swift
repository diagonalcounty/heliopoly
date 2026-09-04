//
//  GameWebView.swift
//  Heliopoly
//
//  Loads the packaged Vite build from WebDist/ (offline, not a remote site).
//
//  Uses a custom URL scheme (heliopoly://) instead of file:// so ES module
//  scripts and CSS load. Module scripts always use CORS mode; file:// has no
//  CORS headers → JS never runs → empty board + dead buttons (HTML only).
//

import SwiftUI
import UIKit
import UniformTypeIdentifiers
import WebKit

/// Full-screen game surface: local `WebDist/` via WKWebView + custom scheme.
struct GameWebView: UIViewRepresentable {
    var onLoadFailed: ((String) -> Void)?
    /// iPhone prototype only (#120). Default false — iPad target is unchanged.
    var injectPhoneOverlay: Bool = false

    init(
        injectPhoneOverlay: Bool = false,
        onLoadFailed: ((String) -> Void)? = nil
    ) {
        self.injectPhoneOverlay = injectPhoneOverlay
        self.onLoadFailed = onLoadFailed
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(onLoadFailed: onLoadFailed, injectPhoneOverlay: injectPhoneOverlay)
    }

    func makeUIView(context: Context) -> SizedWebHost {
        let config = WKWebViewConfiguration()
        config.defaultWebpagePreferences.allowsContentJavaScript = true
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        // Serve bundled WebDist over heliopoly:// so type=module works offline.
        if let schemeHandler = WebDistSchemeHandler(bundle: .main) {
            config.setURLSchemeHandler(
                schemeHandler,
                forURLScheme: WebDistSchemeHandler.scheme
            )
            context.coordinator.schemeHandler = schemeHandler
            context.coordinator.useCustomScheme = true
        } else if injectPhoneOverlay {
            context.coordinator.onLoadFailed?(
                "WebDist/index.html missing from the phone bundle. Run npm run ios:sync, then Clean Build the HeliopolyPhone scheme."
            )
        }

        // Seed CSS safe-area vars before first paint when UIKit already
        // knows insets (avoid writing 0px and clobbering CSS env() defaults).
        let bootInsets = Self.resolvedSafeAreaInsets(for: UIView())
        if bootInsets.top > 0 || bootInsets.bottom > 0 || bootInsets.left > 0
            || bootInsets.right > 0
        {
            let bootJS = Self.safeAreaCSSJavaScript(insets: bootInsets)
            config.userContentController.addUserScript(
                WKUserScript(
                    source: bootJS,
                    injectionTime: .atDocumentStart,
                    forMainFrameOnly: true
                )
            )
        }

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.isOpaque = false
        webView.backgroundColor = Self.spaceBackground
        webView.scrollView.backgroundColor = Self.spaceBackground
        // Keep .never so zoom lock / layout stay stable; CSS vars carry insets.
        webView.scrollView.contentInsetAdjustmentBehavior = injectPhoneOverlay
            ? .automatic
            : .never
        webView.scrollView.bounces = injectPhoneOverlay
        webView.scrollView.alwaysBounceVertical = injectPhoneOverlay
        webView.scrollView.alwaysBounceHorizontal = false
        webView.scrollView.bouncesZoom = false
        webView.allowsBackForwardNavigationGestures = false
        webView.scrollView.contentInset = .zero
        webView.scrollView.scrollIndicatorInsets = .zero
        webView.scrollView.minimumZoomScale = 1
        webView.scrollView.maximumZoomScale = 1
        webView.scrollView.pinchGestureRecognizer?.isEnabled = false
        if #available(iOS 16.4, *) {
            webView.isInspectable = true
        }

        let host = SizedWebHost(webView: webView)
        // Load only after SwiftUI gives the view a real size. Loading at
        // CGRect.zero leaves WKWebView blank on iPhone (works on iPad).
        host.onReady = { [weak coordinator = context.coordinator] readyView in
            coordinator?.startLoadIfNeeded(in: readyView)
        }
        return host
    }

    func updateUIView(_ host: SizedWebHost, context: Context) {
        context.coordinator.onLoadFailed = onLoadFailed
        context.coordinator.injectPhoneOverlay = injectPhoneOverlay
        if host.bounds.width > 1, host.bounds.height > 1 {
            context.coordinator.startLoadIfNeeded(in: host.webView)
        }
    }

    private static var spaceBackground: UIColor {
        UIColor(red: 0.043, green: 0.063, blue: 0.125, alpha: 1) // #0b1020
    }


    /// UIKit insets → CSS --sat/--sar/--sab/--sal (WKWebView env() is often 0
    /// with custom schemes + ignoresSafeArea, so the web UI must be told).
    static func safeAreaCSSJavaScript(insets: UIEdgeInsets) -> String {
        let top = max(0, insets.top)
        let right = max(0, insets.right)
        let bottom = max(0, insets.bottom)
        let left = max(0, insets.left)
        return """
        (function(){
          var r = document.documentElement;
          if (!r || !r.style) return;
          r.style.setProperty('--sat', '\(top)px');
          r.style.setProperty('--sar', '\(right)px');
          r.style.setProperty('--sab', '\(bottom)px');
          r.style.setProperty('--sal', '\(left)px');
        })();
        """
    }

    static func resolvedSafeAreaInsets(for view: UIView) -> UIEdgeInsets {
        var insets = view.safeAreaInsets
        if let window = view.window {
            let w = window.safeAreaInsets
            insets = UIEdgeInsets(
                top: max(insets.top, w.top),
                left: max(insets.left, w.left),
                bottom: max(insets.bottom, w.bottom),
                right: max(insets.right, w.right)
            )
        } else if let scene = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .first(where: { $0.activationState == .foregroundActive })
            ?? UIApplication.shared.connectedScenes.compactMap({ $0 as? UIWindowScene }).first
        {
            let w = scene.keyWindow?.safeAreaInsets
                ?? scene.windows.first?.safeAreaInsets
                ?? .zero
            insets = UIEdgeInsets(
                top: max(insets.top, w.top),
                left: max(insets.left, w.left),
                bottom: max(insets.bottom, w.bottom),
                right: max(insets.right, w.right)
            )
        }
        return insets
    }


    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        var onLoadFailed: ((String) -> Void)?
        var injectPhoneOverlay = false
        var didStartLoad = false
        /// Retained for the life of the web view (configuration also retains it).
        var schemeHandler: WebDistSchemeHandler?
        var useCustomScheme = false

        init(onLoadFailed: ((String) -> Void)?, injectPhoneOverlay: Bool = false) {
            self.onLoadFailed = onLoadFailed
            self.injectPhoneOverlay = injectPhoneOverlay
        }

        func startLoadIfNeeded(in webView: WKWebView) {
            guard !didStartLoad else { return }
            didStartLoad = true
            loadBundledGame(into: webView)
        }

        func loadBundledGame(into webView: WKWebView) {
            // Prefer custom scheme (ES modules + CSS).
            if useCustomScheme, let start = WebDistSchemeHandler.startURL {
                webView.load(URLRequest(url: start))
                return
            }

            // Fallback: file:// (CSS may work after crossorigin strip; modules often still fail).
            guard
                let indexURL = Bundle.main.url(
                    forResource: "index",
                    withExtension: "html",
                    subdirectory: "WebDist"
                )
            else {
                let msg =
                    "WebDist/index.html missing. From the repo root run: npm run ios:sync"
                onLoadFailed?(msg)
                return
            }

            let accessDir = indexURL.deletingLastPathComponent()
            webView.loadFileURL(indexURL, allowingReadAccessTo: accessDir)
        }

        func webView(
            _ webView: WKWebView,
            didFinish navigation: WKNavigation!
        ) {
            // Re-assert scale lock after load (iOS can reset zoom during navigation).
            webView.scrollView.minimumZoomScale = 1
            webView.scrollView.maximumZoomScale = 1
            webView.scrollView.setZoomScale(1, animated: false)
            webView.scrollView.pinchGestureRecognizer?.isEnabled = false
            webView.scrollView.contentOffset = .zero

            // Ensure layout hooks even if WebDist is older than the main.ts
            // heliopoly: protocol check (no ios:sync required for this class).
            // iPad uses native-shell (100dvh lock). On iPhone that lock can
            // paint a 0-height page — dark background, no buttons.
            // Phone: do not add native-shell and do not inject overlay CSS yet.
            // Those were blanking portrait. Show the stock game first.
            if injectPhoneOverlay {
                webView.evaluateJavaScript(
                    """
                    document.documentElement.classList.remove('native-shell');
                    document.documentElement.classList.add('touch-ui');
                    """
                )
            } else {
                webView.evaluateJavaScript(
                    """
                    document.documentElement.classList.add('native-shell');
                    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
                      document.documentElement.classList.add('touch-ui');
                    }
                    var meta = document.querySelector('meta[name="viewport"]');
                    if (meta) {
                      meta.setAttribute(
                        'content',
                        'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no'
                      );
                    }
                    """
                )
            }
            Self.pushSafeAreaCSSVariables(to: webView)
        }

        static func pushSafeAreaCSSVariables(to webView: WKWebView) {
            let insets = GameWebView.resolvedSafeAreaInsets(for: webView)
            let js = GameWebView.safeAreaCSSJavaScript(insets: insets)
            webView.evaluateJavaScript(js, completionHandler: nil)
        }

        func webView(
            _ webView: WKWebView,
            didFailProvisionalNavigation navigation: WKNavigation!,
            withError error: Error
        ) {
            onLoadFailed?(error.localizedDescription)
        }

        func webView(
            _ webView: WKWebView,
            didFail navigation: WKNavigation!,
            withError error: Error
        ) {
            onLoadFailed?(error.localizedDescription)
        }

        /// Keep navigation inside the bundled game (no silent jump to external sites).
        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.cancel)
                return
            }
            if url.isFileURL {
                decisionHandler(.allow)
                return
            }
            if url.scheme?.lowercased() == WebDistSchemeHandler.scheme {
                decisionHandler(.allow)
                return
            }
            // Telemetry / optional https — do not navigate the game shell away.
            if url.scheme == "http" || url.scheme == "https" {
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.cancel)
        }

        // #111 — Quit still uses window.confirm (course change does not).
        func webView(
            _ webView: WKWebView,
            runJavaScriptAlertPanelWithMessage message: String,
            initiatedByFrame frame: WKFrameInfo,
            completionHandler: @escaping () -> Void
        ) {
            presentJsDialog(
                title: nil,
                message: message,
                cancelTitle: nil,
                okTitle: "OK",
                completion: { _ in completionHandler() }
            )
        }

        func webView(
            _ webView: WKWebView,
            runJavaScriptConfirmPanelWithMessage message: String,
            initiatedByFrame frame: WKFrameInfo,
            completionHandler: @escaping (Bool) -> Void
        ) {
            presentJsDialog(
                title: nil,
                message: message,
                cancelTitle: "Cancel",
                okTitle: "OK",
                completion: completionHandler
            )
        }

        func webView(
            _ webView: WKWebView,
            runJavaScriptTextInputPanelWithPrompt prompt: String,
            defaultText: String?,
            initiatedByFrame frame: WKFrameInfo,
            completionHandler: @escaping (String?) -> Void
        ) {
            let alert = UIAlertController(
                title: nil,
                message: prompt,
                preferredStyle: .alert
            )
            alert.addTextField { $0.text = defaultText }
            alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in
                completionHandler(nil)
            })
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
                completionHandler(alert.textFields?.first?.text)
            })
            if !presentOnHost(alert) {
                completionHandler(nil)
            }
        }

        private func presentJsDialog(
            title: String?,
            message: String,
            cancelTitle: String?,
            okTitle: String,
            completion: @escaping (Bool) -> Void
        ) {
            let alert = UIAlertController(
                title: title,
                message: message,
                preferredStyle: .alert
            )
            if let cancelTitle {
                alert.addAction(UIAlertAction(title: cancelTitle, style: .cancel) { _ in
                    completion(false)
                })
            }
            alert.addAction(UIAlertAction(title: okTitle, style: .default) { _ in
                completion(true)
            })
            if !presentOnHost(alert) {
                completion(false)
            }
        }

        @discardableResult
        private func presentOnHost(_ alert: UIAlertController) -> Bool {
            guard let host = Self.topViewController() else {
                return false
            }
            host.present(alert, animated: true)
            return true
        }

        private static func topViewController(
            from root: UIViewController? = nil
        ) -> UIViewController? {
            let start: UIViewController?
            if let root {
                start = root
            } else {
                let scenes = UIApplication.shared.connectedScenes
                    .compactMap { $0 as? UIWindowScene }
                let window = scenes
                    .flatMap(\.windows)
                    .first(where: \.isKeyWindow)
                    ?? scenes.first?.windows.first
                start = window?.rootViewController
            }
            if let nav = start as? UINavigationController {
                return topViewController(from: nav.visibleViewController)
            }
            if let tab = start as? UITabBarController {
                return topViewController(from: tab.selectedViewController)
            }
            if let presented = start?.presentedViewController {
                return topViewController(from: presented)
            }
            return start
        }
    }
}

/// Pins WKWebView to SwiftUI's proposed size, then fires `onReady`.
final class SizedWebHost: UIView {
    let webView: WKWebView
    var onReady: ((WKWebView) -> Void)?
    private var announced = false

    init(webView: WKWebView) {
        self.webView = webView
        super.init(frame: .zero)
        backgroundColor = UIColor(red: 0.043, green: 0.063, blue: 0.125, alpha: 1)
        webView.translatesAutoresizingMaskIntoConstraints = false
        addSubview(webView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: topAnchor),
            webView.bottomAnchor.constraint(equalTo: bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: trailingAnchor),
        ])
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { nil }

    override func layoutSubviews() {
        super.layoutSubviews()
        pushSafeAreaCSSVariables()
        guard !announced, bounds.width > 1, bounds.height > 1 else { return }
        announced = true
        onReady?(webView)
    }

    override func safeAreaInsetsDidChange() {
        super.safeAreaInsetsDidChange()
        pushSafeAreaCSSVariables()
    }

    private func pushSafeAreaCSSVariables() {
        let insets = GameWebView.resolvedSafeAreaInsets(for: self)
        let js = GameWebView.safeAreaCSSJavaScript(insets: insets)
        webView.evaluateJavaScript(js, completionHandler: nil)
    }
}

// MARK: - heliopoly:// scheme → WebDist/

/// Maps `heliopoly://game/…` to `Bundle …/WebDist/…` with correct MIME types.
/// ES modules require a non-file origin; this scheme is that origin.
final class WebDistSchemeHandler: NSObject, WKURLSchemeHandler {
    static let scheme = "heliopoly"
    static let host = "game"

    /// Entry URL for the offline game.
    static var startURL: URL? {
        URL(string: "\(scheme)://\(host)/index.html")
    }

    private let rootURL: URL

    init?(bundle: Bundle = .main) {
        guard
            let index = bundle.url(
                forResource: "index",
                withExtension: "html",
                subdirectory: "WebDist"
            )
        else {
            return nil
        }
        rootURL = index.deletingLastPathComponent().standardizedFileURL
    }

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url else {
            urlSchemeTask.didFailWithError(URLError(.badURL))
            return
        }

        var relative = url.path
        if relative.hasPrefix("/") {
            relative = String(relative.dropFirst())
        }
        if relative.isEmpty {
            relative = "index.html"
        }
        // Decode percent-encoding (e.g. spaces in paths if any).
        if let decoded = relative.removingPercentEncoding {
            relative = decoded
        }

        let fileURL = rootURL.appendingPathComponent(relative).standardizedFileURL
        let rootPath = rootURL.path
        // Path traversal guard.
        guard fileURL.path == rootPath || fileURL.path.hasPrefix(rootPath + "/") else {
            urlSchemeTask.didFailWithError(URLError(.noPermissionsToReadFile))
            return
        }

        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            urlSchemeTask.didFailWithError(URLError(.fileDoesNotExist))
            return
        }

        let data: Data
        do {
            data = try Data(contentsOf: fileURL)
        } catch {
            urlSchemeTask.didFailWithError(error)
            return
        }

        let mime = Self.mimeType(for: fileURL)
        let headers: [String: String] = [
            "Content-Type": mime,
            "Content-Length": "\(data.count)",
            // Harmless for same-origin scheme loads; helps if anything still CORS-checks.
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache",
        ]

        guard
            let response = HTTPURLResponse(
                url: url,
                statusCode: 200,
                httpVersion: "HTTP/1.1",
                headerFields: headers
            )
        else {
            urlSchemeTask.didFailWithError(URLError(.cannotParseResponse))
            return
        }

        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(data)
        urlSchemeTask.didFinish()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        // Nothing to cancel; reads are synchronous from the bundle.
    }

    private static func mimeType(for url: URL) -> String {
        switch url.pathExtension.lowercased() {
        case "html", "htm":
            return "text/html; charset=utf-8"
        case "js", "mjs":
            // Required for ES modules in WKWebView.
            return "text/javascript; charset=utf-8"
        case "css":
            return "text/css; charset=utf-8"
        case "png":
            return "image/png"
        case "jpg", "jpeg":
            return "image/jpeg"
        case "svg":
            return "image/svg+xml"
        case "ico":
            return "image/x-icon"
        case "json", "map":
            return "application/json"
        case "woff":
            return "font/woff"
        case "woff2":
            return "font/woff2"
        case "webp":
            return "image/webp"
        case "gif":
            return "image/gif"
        default:
            if let type = UTType(filenameExtension: url.pathExtension),
               let mime = type.preferredMIMEType
            {
                return mime
            }
            return "application/octet-stream"
        }
    }
}
