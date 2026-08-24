//
//  GameWebView.swift
//  HeliopolyPhone
//
//  Phone-only host (#126 / #148). iPad uses Heliopoly/GameWebView.swift.
//  Loads packaged Vite WebDist/ offline via heliopoly:// (ES modules need a
//  non-file origin). PhoneOverlay is served as real files next to WebDist
//  (one boot path — no user-script restack, no didFinish CSS/JS dump).
//

import SwiftUI
import UIKit
import UniformTypeIdentifiers
import WebKit

/// Phone game surface: local `WebDist/` via WKWebView + custom scheme.
struct GameWebView: UIViewRepresentable {
    var onLoadFailed: ((String) -> Void)?
    /// When true, stamp navy + overlay file tags into served HTML (#150).
    var injectPhoneOverlay: Bool = true

    init(
        injectPhoneOverlay: Bool = true,
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
        // Persistent WK cache served a stale unstyled index (white scroll after
        // a good launch). Phone proto always boots from the scheme handler.
        config.websiteDataStore = .nonPersistent()

        // Serve bundled WebDist over heliopoly:// so type=module works offline.
        if let schemeHandler = WebDistSchemeHandler(bundle: .main) {
            config.setURLSchemeHandler(
                schemeHandler,
                forURLScheme: WebDistSchemeHandler.scheme
            )
            context.coordinator.schemeHandler = schemeHandler
            context.coordinator.useCustomScheme = true
        } else {
            context.coordinator.onLoadFailed?(
                "WebDist/index.html missing from the phone bundle. Run npm run ios:sync, then Clean Build the HeliopolyPhone scheme."
            )
        }

        if injectPhoneOverlay {
            // Navy first-paint only. A restack stylesheet at document-start
            // blanked the WKWebView. Overlay CSS/JS load as heliopoly:// files.
            config.userContentController.addUserScript(Self.navyPaintUserScript)
        }

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        // Opaque so SwiftUI views behind the web view do not steal taps.
        webView.isOpaque = true
        webView.isUserInteractionEnabled = true
        webView.backgroundColor = Self.spaceBackground
        webView.scrollView.backgroundColor = Self.spaceBackground
        if #available(iOS 15.0, *) {
            webView.underPageBackgroundColor = Self.spaceBackground
        }
        // Keep page scroll until overlay restacks. Disabling it left a white
        // locked screen when first paint missed. Buttons still get the touch
        // immediately (no 150ms delay).
        webView.scrollView.isScrollEnabled = true
        webView.scrollView.delaysContentTouches = false
        webView.scrollView.canCancelContentTouches = false
        // Overlay owns layout. WKWebView rubber-band was the scroll-fight in HITL.
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.bounces = false
        webView.scrollView.alwaysBounceVertical = false
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
        // CGRect.zero leaves WKWebView blank on iPhone.
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

    /// Navy first-paint only. Restack lives in PhoneOverlay files, not here.
    private static var navyPaintUserScript: WKUserScript {
        let source = """
        (function(){
          try {
            var h=document.documentElement;
            h.style.background='#0b1020';
            h.style.color='#e8eefc';
            h.style.colorScheme='dark';
            if (document.body) {
              document.body.style.background='#0b1020';
              document.body.style.color='#e8eefc';
            }
          } catch (e) {}
        })();
        """
        return WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true)
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        var onLoadFailed: ((String) -> Void)?
        var injectPhoneOverlay = true
        var didStartLoad = false
        /// Retained for the life of the web view (configuration also retains it).
        var schemeHandler: WebDistSchemeHandler?
        var useCustomScheme = false

        init(onLoadFailed: ((String) -> Void)?, injectPhoneOverlay: Bool = true) {
            self.onLoadFailed = onLoadFailed
            self.injectPhoneOverlay = injectPhoneOverlay
        }

        func startLoadIfNeeded(in webView: WKWebView) {
            guard !didStartLoad else { return }
            didStartLoad = true
            if injectPhoneOverlay, let missing = schemeHandler?.missingOverlayMessage() {
                onLoadFailed?(missing)
                return
            }
            loadBundledGame(into: webView)
        }

        func loadBundledGame(into webView: WKWebView) {
            // Prefer custom scheme (ES modules + CSS).
            if useCustomScheme, let start = WebDistSchemeHandler.startURL {
                var req = URLRequest(url: start)
                req.cachePolicy = .reloadIgnoringLocalCacheData
                webView.load(req)
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
            didStartProvisionalNavigation navigation: WKNavigation!
        ) {
            webView.backgroundColor = GameWebView.spaceBackground
            webView.scrollView.backgroundColor = GameWebView.spaceBackground
        }

        func webView(_ webView: WKWebView, didCommit navigation: WKNavigation!) {
            webView.backgroundColor = GameWebView.spaceBackground
            webView.scrollView.backgroundColor = GameWebView.spaceBackground
        }

        func webView(
            _ webView: WKWebView,
            didFinish navigation: WKNavigation!
        ) {
            // Scale lock only. Overlay CSS/JS already arrived as heliopoly:// files.
            webView.backgroundColor = GameWebView.spaceBackground
            webView.scrollView.backgroundColor = GameWebView.spaceBackground
            webView.scrollView.minimumZoomScale = 1
            webView.scrollView.maximumZoomScale = 1
            webView.scrollView.setZoomScale(1, animated: false)
            webView.scrollView.pinchGestureRecognizer?.isEnabled = false
            webView.scrollView.contentOffset = .zero
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
        isUserInteractionEnabled = true
        backgroundColor = UIColor(red: 0.043, green: 0.063, blue: 0.125, alpha: 1)
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.isUserInteractionEnabled = true
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
        guard !announced, bounds.width > 1, bounds.height > 1 else { return }
        announced = true
        onReady?(webView)
    }

    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        let inWeb = convert(point, to: webView)
        return webView.hitTest(inWeb, with: event) ?? webView
    }
}

// MARK: - heliopoly:// scheme → WebDist/

/// Maps `heliopoly://game/…` to `Bundle …/WebDist/…` with correct MIME types.
/// ES modules require a non-file origin; this scheme is that origin.
final class WebDistSchemeHandler: NSObject, WKURLSchemeHandler {
    static let scheme = "heliopoly"
    static let host = "game"

    /// Entry URL for the offline game. Query busts WK HTTP cache.
    static var startURL: URL? {
        let t = Int(Date().timeIntervalSince1970)
        return URL(string: "\(scheme)://\(host)/index.html?boot=\(t)")
    }

    private let rootURL: URL
    private let lock = NSLock()
    private let stopped = NSHashTable<AnyObject>.weakObjects()

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

    /// Copy PhoneOverlay → WebDist/phone-overlay in the HeliopolyPhone target.
    func missingOverlayMessage() -> String? {
        let css = rootURL.appendingPathComponent("phone-overlay/phone.css")
        let js = rootURL.appendingPathComponent("phone-overlay/phone.js")
        let fm = FileManager.default
        guard fm.fileExists(atPath: css.path), fm.fileExists(atPath: js.path) else {
            return "PhoneOverlay missing from the phone bundle (WebDist/phone-overlay). Clean Build HeliopolyPhone."
        }
        return nil
    }

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url else {
            fail(urlSchemeTask, URLError(.badURL))
            return
        }

        var relative = url.path
        if relative.hasPrefix("/") {
            relative = String(relative.dropFirst())
        }
        if relative.isEmpty {
            relative = "index.html"
        }
        if let decoded = relative.removingPercentEncoding {
            relative = decoded
        }

        let fileURL = rootURL.appendingPathComponent(relative).standardizedFileURL
        let rootPath = rootURL.path
        guard fileURL.path == rootPath || fileURL.path.hasPrefix(rootPath + "/") else {
            fail(urlSchemeTask, URLError(.noPermissionsToReadFile))
            return
        }
        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            NSLog("[heliopoly] 404 %@", relative)
            fail(urlSchemeTask, URLError(.fileDoesNotExist))
            return
        }

        let data: Data
        do {
            data = try Data(contentsOf: fileURL)
        } catch {
            fail(urlSchemeTask, error)
            return
        }

        var body = data
        let ext = fileURL.pathExtension.lowercased()
        if ext == "html" || ext == "htm", var html = String(data: data, encoding: .utf8) {
            if let missing = missingOverlayMessage() {
                NSLog("[heliopoly] FAIL %@", missing)
                fail(urlSchemeTask, URLError(.fileDoesNotExist))
                return
            }
            html = Self.phoneBootHTML(html)
            body = Data(html.utf8)
        }

        // URLResponse, not HTTPURLResponse: WKWebView custom schemes drop CSS/JS
        // when the response looks like HTTP (white HTML, scrollable, intermittent).
        let (mime, encoding) = Self.mimeAndEncoding(for: fileURL)
        NSLog("[heliopoly] 200 %@ mime=%@ bytes=%d", relative, mime, body.count)
        let response = URLResponse(
            url: url,
            mimeType: mime,
            expectedContentLength: body.count,
            textEncodingName: encoding
        )
        finish(urlSchemeTask, response: response, body: body)
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        lock.lock()
        stopped.add(urlSchemeTask)
        lock.unlock()
    }

    private func isStopped(_ task: WKURLSchemeTask) -> Bool {
        lock.lock()
        defer { lock.unlock() }
        return stopped.contains(task)
    }

    private func fail(_ task: WKURLSchemeTask, _ error: Error) {
        let run = {
            guard !self.isStopped(task) else { return }
            task.didFailWithError(error)
        }
        if Thread.isMainThread { run() } else { DispatchQueue.main.async(execute: run) }
    }

    private func finish(
        _ task: WKURLSchemeTask,
        response: URLResponse,
        body: Data
    ) {
        let run = {
            guard !self.isStopped(task) else { return }
            task.didReceive(response)
            guard !self.isStopped(task) else { return }
            task.didReceive(body)
            guard !self.isStopped(task) else { return }
            task.didFinish()
        }
        if Thread.isMainThread { run() } else { DispatchQueue.main.async(execute: run) }
    }

    /// Stamp navy on the tags (cannot parse-fail) and link overlay as files.
    /// This is the only overlay boot path.
    private static func phoneBootHTML(_ source: String) -> String {
        var html = source.replacingOccurrences(of: " crossorigin", with: "")
        if let re = try? NSRegularExpression(pattern: "<html\\b[^>]*>", options: .caseInsensitive) {
            html = re.stringByReplacingMatches(
                in: html,
                options: [],
                range: NSRange(html.startIndex..., in: html),
                withTemplate:
                    "<html lang=\"en\" class=\"phone-proto phone-setup touch-ui\" style=\"background:#0b1020;color:#e8eefc;color-scheme:dark\">"
            )
        }
        if let re = try? NSRegularExpression(pattern: "<body\\b[^>]*>", options: .caseInsensitive) {
            html = re.stringByReplacingMatches(
                in: html,
                options: [],
                range: NSRange(html.startIndex..., in: html),
                withTemplate:
                    "<body style=\"background:#0b1020;color:#e8eefc;margin:0\">"
            )
        }
        if !html.contains("phone-overlay/phone.css") {
            let tags = """
            <meta name="color-scheme" content="dark">
            <style id="phone-paint-css">html,body,#app{background:#0b1020!important;color:#e8eefc!important;color-scheme:dark}</style>
            <link rel="stylesheet" href="./phone-overlay/phone.css">
            <script src="./phone-overlay/phone.js" defer></script>
            """
            html = html.replacingOccurrences(of: "</head>", with: tags + "</head>")
        }
        return html
    }

    private static func mimeAndEncoding(for url: URL) -> (String, String?) {
        switch url.pathExtension.lowercased() {
        case "html", "htm":
            return ("text/html", "utf-8")
        case "js", "mjs":
            return ("text/javascript", "utf-8")
        case "css":
            return ("text/css", "utf-8")
        case "png":
            return ("image/png", nil)
        case "jpg", "jpeg":
            return ("image/jpeg", nil)
        case "svg":
            return ("image/svg+xml", "utf-8")
        case "ico":
            return ("image/x-icon", nil)
        case "json", "map":
            return ("application/json", "utf-8")
        case "woff":
            return ("font/woff", nil)
        case "woff2":
            return ("font/woff2", nil)
        case "webp":
            return ("image/webp", nil)
        case "gif":
            return ("image/gif", nil)
        default:
            if let type = UTType(filenameExtension: url.pathExtension),
               let mime = type.preferredMIMEType
            {
                return (mime, nil)
            }
            return ("application/octet-stream", nil)
        }
    }
}
