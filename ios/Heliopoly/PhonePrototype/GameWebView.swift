//
//  GameWebView.swift
//  HeliopolyPhone
//
//  Phone-only host (#126 / #148). iPad uses Heliopoly/GameWebView.swift.
//  Loads packaged Vite WebDist/ offline via heliopoly:// (ES modules need a
//  non-file origin). Injects PhoneOverlay for the #150 bottom-thumb restack.
//

import SwiftUI
import UIKit
import UniformTypeIdentifiers
import WebKit

/// Phone game surface: local `WebDist/` via WKWebView + custom scheme.
struct GameWebView: UIViewRepresentable {
    var onLoadFailed: ((String) -> Void)?
    /// When true, load PhoneOverlay CSS/JS from the phone bundle (#148).
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
            // Tiny CSS only at parse. Full phone.css as a user script blanked
            // the WKWebView (gold bar + white page). Full overlay injects in
            // didFinish, which is the path that actually painted on device.
            config.userContentController.addUserScript(Self.criticalOverlayUserScript)
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

    /// CSS that does not depend on PhoneOverlay files or phone.js.
    /// Uses :has(#fleet-card.mode-standings) so play restacks even if JS never runs.
    private static let criticalOverlayCSS = """
    html.phone-proto{color-scheme:dark!important;background:#0b1020!important;color:#e8eefc!important}
    html.phone-proto body,html.phone-proto #app{background:#0b1020!important;color:#e8eefc!important}
    html.phone-proto.phone-setup .board-panel,html.phone-proto.phone-setup .board-stage,html.phone-proto.phone-setup #board{max-width:56px!important;max-height:56px!important;width:56px!important;height:56px!important;overflow:hidden!important;margin:0 auto!important}
    html.phone-proto.phone-setup #fleet-card,html.phone-proto.phone-setup #setup-body{display:flex!important;visibility:visible!important;background:#141b2f!important;color:#e8eefc!important}
    html.phone-proto.phone-setup #btn-new{display:block!important;color:#e8eefc!important}
    html.phone-proto.phone-setup #setup-body .check:has([value="methane"])::after{content:"Methane"}
    html.phone-proto.phone-setup #setup-body .check:has([value="hydrogen"])::after{content:"Hydrogen"}
    html.phone-proto.phone-setup #setup-body .check:has([value="easy"])::after{content:"Easy"}
    html.phone-proto.phone-setup #setup-body .check:has([value="normal"])::after{content:"Normal"}
    html.phone-proto.phone-setup #setup-body .check:has([value="hard"])::after{content:"Hard"}
    html.phone-proto.phone-setup #setup-body .check:has([value="expert"])::after{content:"Expert"}
    html.phone-proto.phone-setup #setup-body .check::after{font-size:.9rem;font-weight:600;color:#e8eefc}
    html.phone-proto #btn-selfplay,html.phone-proto .anim-speed-field{display:none!important}
    html.phone-proto #handbook-root.hidden,html.phone-proto #lab-root.hidden,html.phone-proto #duel-root.hidden,html.phone-proto #announce-root.hidden,html.phone-proto #auction-root.hidden,html.phone-proto #dossier-root.hidden,html.phone-proto #eac-root.hidden{display:none!important;pointer-events:none!important;z-index:-1!important}
    html.phone-proto.phone-setup #welcome-card,html.phone-proto.phone-setup #pilot-controls,html.phone-proto.phone-setup .log-card{display:none!important;pointer-events:none!important}
    html.phone-proto.phone-setup #duration-meter .duration-meter-body,html.phone-proto.phone-setup #setup-body>label:has(#player-count),html.phone-proto.phone-setup #setup-body>label.check:has(#include-human),html.phone-proto.phone-setup #setup-body .hint{display:none!important}
    html.phone-proto.phone-setup .ai-difficulty-field{min-height:0!important;height:auto!important}
    html.phone-proto.phone-setup #btn-new{min-height:56px!important;width:100%!important;pointer-events:auto!important;position:relative;z-index:80}
    html.phone-proto.phone-setup #setup-body .check{position:relative;font-size:0}
    html.phone-proto.phone-setup #setup-body .check input{position:absolute;inset:0;width:100%;height:100%;opacity:0;margin:0;pointer-events:auto!important}
    html.phone-proto #btn-handbook-header span{font-size:0!important;line-height:0!important}
    html.phone-proto #btn-handbook-header span::after{content:"Book";font-size:1rem;line-height:1.2;font-weight:700;color:#ffc857}
    html.phone-proto .break-stepper{height:56px!important;overflow:visible!important}
    html.phone-proto .break-stepper button,html.phone-proto #btn-break-minus,html.phone-proto #btn-break-plus{min-width:56px!important;width:56px!important;height:56px!important;min-height:56px!important;font-size:1.6rem!important;font-weight:800!important}
    html.phone-proto .break-count{font-size:1.6rem!important;min-width:40px!important}
    html.phone-proto:has(#fleet-card.mode-standings),html.phone-proto:has(#fleet-card.mode-standings) body,html.phone-proto:has(#fleet-card.mode-standings) #app{height:100%!important;max-height:100%!important;overflow:hidden!important;margin:0;padding:0!important;display:flex!important;flex-direction:column!important}
    html.phone-proto:has(#fleet-card.mode-standings) .top h1,html.phone-proto:has(#fleet-card.mode-standings) .badge,html.phone-proto:has(#fleet-card.mode-standings) .title-tagline,html.phone-proto:has(#fleet-card.mode-standings) #btn-lab{display:none!important}
    html.phone-proto:has(#fleet-card.mode-standings) header.top{flex:0 0 auto;padding:4px 8px}
    html.phone-proto:has(#fleet-card.mode-standings) .layout{flex:1 1 auto;min-height:0;display:flex!important;flex-direction:column!important;gap:0}
    html.phone-proto:has(#fleet-card.mode-standings) .board-panel{flex:1 1 auto;min-height:0;margin:0;border:none;display:flex;align-items:center;justify-content:center}
    html.phone-proto:has(#fleet-card.mode-standings) #board{max-width:100%!important;max-height:100%!important;width:100%!important}
    html.phone-proto:has(#fleet-card.mode-standings) #welcome-card,html.phone-proto:has(#fleet-card.mode-standings) .side>#fleet-card,html.phone-proto:has(#fleet-card.mode-standings) .side>.log-card,html.phone-proto:has(#fleet-card.mode-standings) .pilot-controls-head,html.phone-proto:has(#fleet-card.mode-standings) #telemetry,html.phone-proto:has(#fleet-card.mode-standings) .ring-opacity-field,html.phone-proto:has(#fleet-card.mode-standings) #dir-row{display:none!important}
    html.phone-proto:has(#fleet-card.mode-standings) .side{flex:0 0 auto;max-height:none!important;overflow:visible!important}
    html.phone-proto:has(#fleet-card.mode-standings) #pilot-controls{position:relative!important;width:100%!important;margin:0!important;inset:auto!important;display:flex!important;flex-direction:column;gap:6px;padding:8px 10px max(10px,env(safe-area-inset-bottom,0px));border-radius:16px 16px 0 0}
    html.phone-proto:has(#fleet-card.mode-standings) .actions{display:flex!important;flex-wrap:wrap;gap:6px}
    html.phone-proto:has(#fleet-card.mode-standings) .actions button:disabled{display:none!important}
    html.phone-proto:has(#fleet-card.mode-standings) .actions #btn-roll:not(:disabled),html.phone-proto:has(#fleet-card.mode-standings) .actions #btn-buy:not(:disabled),html.phone-proto:has(#fleet-card.mode-standings) .actions #btn-end:not(:disabled){flex:1 1 40%;min-height:56px!important;font-size:1.1rem!important;font-weight:800!important}
    html.phone-proto #duel-root .dice-vs{display:none!important}
    html.phone-proto #duel-root .dice-stage{display:flex!important;flex-direction:column!important;flex-wrap:nowrap!important;align-items:stretch!important}
    html.phone-proto #duel-root .dice-pair{flex-direction:column!important}
    html.phone-proto #duel-root .duel-btn{min-height:56px!important}
    """

    private static var criticalOverlayUserScript: WKUserScript {
        let cssJSON =
            (try? String(data: JSONEncoder().encode(criticalOverlayCSS), encoding: .utf8))
            ?? "\"\""
        let source = """
        (function(){
          try {
            var h=document.documentElement;
            h.classList.remove('native-shell');
            h.classList.add('touch-ui','phone-proto','phone-setup');
            h.style.colorScheme='dark';
            h.style.background='#0b1020';
            h.style.color='#e8eefc';
            if(!document.getElementById('phone-critical-css')){
              var s=document.createElement('style');
              s.id='phone-critical-css';
              s.textContent=\(cssJSON);
              (document.head||h).appendChild(s);
            }
          } catch (e) {}
        })();
        """
        return WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true)
    }

    /// Read PhoneOverlay files from the app bundle (Copy PhoneOverlay → WebDist/phone-overlay).
    fileprivate static func overlayResource(name: String, ext: String) -> String? {
        let bundle = Bundle.main
        let url =
            bundle.url(forResource: name, withExtension: ext, subdirectory: "WebDist/phone-overlay")
            ?? bundle.url(forResource: name, withExtension: ext, subdirectory: "PhoneOverlay")
        guard let url, let text = try? String(contentsOf: url, encoding: .utf8) else {
            return nil
        }
        return text
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
            loadBundledGame(into: webView)
        }

        func injectOverlay(into webView: WKWebView, js: Bool) {
            guard
                let css = GameWebView.overlayResource(name: "phone", ext: "css"),
                let cssJSON = try? String(data: JSONEncoder().encode(css), encoding: .utf8)
            else {
                onLoadFailed?(
                    "PhoneOverlay missing from the phone bundle. Clean Build HeliopolyPhone."
                )
                return
            }
            // CSS via a style node. JS must be evaluateJavaScript'd — a <script>
            // inserted from here does not run in WKWebView (Book/thumbs never appeared).
            let cssSource = """
            (function () {
              var h = document.documentElement;
              h.classList.remove('native-shell');
              h.classList.add('touch-ui', 'phone-proto', 'phone-setup');
              h.style.colorScheme = 'dark';
              h.style.background = '#0b1020';
              h.style.color = '#e8eefc';
              if (document.body) {
                document.body.style.background = '#0b1020';
                document.body.style.color = '#e8eefc';
              }
              if (!document.getElementById('phone-overlay-css')) {
                var st = document.createElement('style');
                st.id = 'phone-overlay-css';
                st.textContent = \(cssJSON);
                (document.head || h).appendChild(st);
              }
            })();
            """
            webView.evaluateJavaScript(cssSource) { _, error in
                if let error {
                    self.onLoadFailed?("PhoneOverlay CSS inject failed: \(error.localizedDescription)")
                    return
                }
                guard js, let overlayJS = GameWebView.overlayResource(name: "phone", ext: "js") else {
                    return
                }
                webView.evaluateJavaScript(overlayJS) { _, jsError in
                    if let jsError {
                        self.onLoadFailed?(
                            "PhoneOverlay JS inject failed: \(jsError.localizedDescription)"
                        )
                    }
                }
            }
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
            didStartProvisionalNavigation navigation: WKNavigation!
        ) {
            webView.backgroundColor = GameWebView.spaceBackground
            webView.scrollView.backgroundColor = GameWebView.spaceBackground
        }

        func webView(_ webView: WKWebView, didCommit navigation: WKNavigation!) {
            webView.backgroundColor = GameWebView.spaceBackground
            webView.scrollView.backgroundColor = GameWebView.spaceBackground
            // Don't wait for images/fonts — that's a white scrollable empty page.
            if injectPhoneOverlay {
                injectOverlay(into: webView, js: false)
            }
        }

        func webView(
            _ webView: WKWebView,
            didFinish navigation: WKNavigation!
        ) {
            // Re-assert scale lock after load (iOS can reset zoom during navigation).
            webView.backgroundColor = GameWebView.spaceBackground
            webView.scrollView.backgroundColor = GameWebView.spaceBackground
            webView.scrollView.minimumZoomScale = 1
            webView.scrollView.maximumZoomScale = 1
            webView.scrollView.setZoomScale(1, animated: false)
            webView.scrollView.pinchGestureRecognizer?.isEnabled = false
            webView.scrollView.contentOffset = .zero

            // Phone: never apply iPad native-shell (100dvh lock blanks portrait).
            if injectPhoneOverlay {
                injectOverlay(into: webView, js: true)
            } else {
                webView.evaluateJavaScript(
                    """
                    document.documentElement.classList.remove('native-shell');
                    document.documentElement.classList.add('touch-ui');
                    """
                )
            }
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

        var body = data
        let ext = fileURL.pathExtension.lowercased()
        // Vite stamps crossorigin on module/CSS. WKWebView custom schemes treat
        // that as CORS and can drop both — unstyled HTML, white empty scroll.
        if ext == "html" || ext == "htm", var html = String(data: data, encoding: .utf8) {
            html = html.replacingOccurrences(of: " crossorigin", with: "")
            body = Data(html.utf8)
        }

        let mime = Self.mimeType(for: fileURL)
        let headers: [String: String] = [
            "Content-Type": mime,
            "Content-Length": "\(body.count)",
            "Access-Control-Allow-Origin": "*",
            "Cross-Origin-Resource-Policy": "cross-origin",
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
        urlSchemeTask.didReceive(body)
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
