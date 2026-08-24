//
//  GameWebView.swift
//  HeliopolyPhone
//
//  Phone-only host (#126 / #148). iPad uses Heliopoly/GameWebView.swift.
//  Main HTML is loadHTMLString (custom-scheme HTML never painted on device).
//  heliopoly:// only serves JS / images / overlay script. CSS is inlined.
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
            // Main document does not go through heliopoly://. THUMBS · 2 proved
            // the scheme-served HTML never paints (navy-on-tags + inlined CSS
            // still a white scroll). Give WKWebView the HTML string; the scheme
            // only answers JS / images / overlay script.
            if useCustomScheme, let html = schemeHandler?.bootHTMLDocument() {
                webView.loadHTMLString(
                    html,
                    baseURL: URL(string: "heliopoly://game/index.html")
                )
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

    /// Stamped, CSS-inlined index. Used by loadHTMLString so the document
    /// never depends on WKURLSchemeHandler returning HTML.
    func bootHTMLDocument() -> String? {
        let index = rootURL.appendingPathComponent("index.html")
        guard let source = try? String(contentsOf: index, encoding: .utf8) else {
            return nil
        }
        return phoneBootHTML(source)
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
        if let decoded = relative.removingPercentEncoding {
            relative = decoded
        }

        let fileURL = rootURL.appendingPathComponent(relative).standardizedFileURL
        let rootPath = rootURL.path
        guard fileURL.path == rootPath || fileURL.path.hasPrefix(rootPath + "/") else {
            urlSchemeTask.didFailWithError(URLError(.noPermissionsToReadFile))
            return
        }
        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            NSLog("[heliopoly] 404 %@", relative)
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
        if ext == "html" || ext == "htm", var html = String(data: data, encoding: .utf8) {
            if let missing = missingOverlayMessage() {
                NSLog("[heliopoly] FAIL %@", missing)
                urlSchemeTask.didFailWithError(URLError(.fileDoesNotExist))
                return
            }
            html = phoneBootHTML(html)
            body = Data(html.utf8)
        }

        // Same contract as the working iPad handler: HTTP 200, CORS, charset.
        // URLResponse (no status) + finishing CSS on the main queue is why
        // this screen goes white — WebKit drops the stylesheet.
        let mime = Self.contentType(for: fileURL)
        NSLog("[heliopoly] 200 %@ mime=%@ bytes=%d", relative, mime, body.count)
        guard
            let response = HTTPURLResponse(
                url: url,
                statusCode: 200,
                httpVersion: "HTTP/1.1",
                headerFields: [
                    "Content-Type": mime,
                    "Content-Length": "\(body.count)",
                    "Access-Control-Allow-Origin": "*",
                    "Cache-Control": "no-store",
                ]
            )
        else {
            urlSchemeTask.didFailWithError(URLError(.cannotParseResponse))
            return
        }

        // Bundle reads finish on this thread before start returns. Hopping to
        // main + skipping "stopped" tasks is a race: WebKit cancels CSS, we
        // never deliver it, unstyled 900px canvas = scrollable white page.
        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(body)
        urlSchemeTask.didFinish()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        // Nothing to cancel; reads finish inside start(_:).
    }

    /// Stamp navy on the tags and **inline** CSS. `<link rel=stylesheet>` over
    /// `heliopoly://` is what arrives as a white 900px canvas — the bytes 200
    /// and WebKit still does not apply them. Overlay JS stays a file.
    private func phoneBootHTML(_ source: String) -> String {
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
        html = inlineStylesheetLinks(in: html)
        if !html.contains("id=\"phone-overlay-css\"") {
            let overlayCSS = (try? String(
                contentsOf: rootURL.appendingPathComponent("phone-overlay/phone.css"),
                encoding: .utf8
            )) ?? ""
            let tags = """
            <meta name="color-scheme" content="dark">
            <style id="phone-paint-css">html,body,#app,#board{background:#0b1020!important;color:#e8eefc!important;color-scheme:dark}</style>
            <style id="phone-overlay-css">\(Self.safeStyle(overlayCSS))</style>
            <script src="./phone-overlay/phone.js" defer></script>
            """
            html = html.replacingOccurrences(of: "</head>", with: tags + "</head>")
        }
        if !html.contains("id=\"phone-boot-mark\"") {
            let mark = """
            <div id="phone-boot-mark" style="position:fixed;left:8px;bottom:8px;z-index:2147483647;background:#ffc857;color:#0b1020;font:700 12px/1.2 -apple-system,sans-serif;padding:6px 8px;border-radius:6px">phone 3</div>
            """
            html = html.replacingOccurrences(of: "</body>", with: mark + "</body>")
        }
        return html
    }

    /// Replace each stylesheet `<link>` with the file contents. No second hop.
    private func inlineStylesheetLinks(in html: String) -> String {
        guard
            let re = try? NSRegularExpression(
                pattern: "<link\\b[^>]*rel=[\"']stylesheet[\"'][^>]*>",
                options: .caseInsensitive
            )
        else {
            return html
        }
        let ns = html as NSString
        let matches = re.matches(in: html, options: [], range: NSRange(location: 0, length: ns.length))
        var result = html
        for match in matches.reversed() {
            let tag = ns.substring(with: match.range)
            guard let href = Self.href(fromLinkTag: tag) else { continue }
            var rel = href
            if rel.hasPrefix("./") { rel = String(rel.dropFirst(2)) }
            if rel.hasPrefix("/") { rel = String(rel.dropFirst()) }
            let file = rootURL.appendingPathComponent(rel).standardizedFileURL
            guard
                file.path.hasPrefix(rootURL.path),
                let css = try? String(contentsOf: file, encoding: .utf8),
                let range = Range(match.range, in: result)
            else {
                continue
            }
            result.replaceSubrange(
                range,
                with: "<style data-inlined=\"\(rel)\">\(Self.safeStyle(css))</style>"
            )
        }
        return result
    }

    private static func href(fromLinkTag tag: String) -> String? {
        guard
            let re = try? NSRegularExpression(
                pattern: "href=[\"']([^\"']+)[\"']",
                options: .caseInsensitive
            ),
            let match = re.firstMatch(in: tag, range: NSRange(tag.startIndex..., in: tag)),
            match.numberOfRanges > 1,
            let range = Range(match.range(at: 1), in: tag)
        else {
            return nil
        }
        return String(tag[range])
    }

    private static func safeStyle(_ css: String) -> String {
        css.replacingOccurrences(of: "</", with: "<\\/")
    }

    private static func contentType(for url: URL) -> String {
        switch url.pathExtension.lowercased() {
        case "html", "htm":
            return "text/html; charset=utf-8"
        case "js", "mjs":
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
