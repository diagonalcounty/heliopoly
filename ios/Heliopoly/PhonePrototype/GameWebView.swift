//
//  GameWebView.swift
//  HeliopolyPhone
//
//  Phone-only host (#156). Main document is http://127.0.0.1 (real HTTP).
//  Custom scheme and loadHTMLString never painted on device (#150).
//  No PhoneOverlay boot — layout lives in src/ (lane A).
//  iPad uses Heliopoly/GameWebView.swift.
//

import Darwin
import SwiftUI
import UIKit
import UniformTypeIdentifiers
import WebKit

/// Phone game surface: bundled `WebDist/` over loopback HTTP.
struct GameWebView: UIViewRepresentable {
    var onLoadFailed: ((String) -> Void)?

    init(onLoadFailed: ((String) -> Void)? = nil) {
        self.onLoadFailed = onLoadFailed
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(onLoadFailed: onLoadFailed)
    }

    func makeUIView(context: Context) -> SizedWebHost {
        let config = WKWebViewConfiguration()
        config.defaultWebpagePreferences.allowsContentJavaScript = true
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        // Persistent store + a stable loopback origin so static files can cache
        // across launches. nonPersistent + a random port made every open cold.
        config.userContentController.addUserScript(Self.navyPaintUserScript)

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
        // Keep page scroll until lane A restacks setup into the first viewport.
        webView.scrollView.isScrollEnabled = true
        webView.scrollView.delaysContentTouches = false
        webView.scrollView.canCancelContentTouches = false
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
        if host.bounds.width > 1, host.bounds.height > 1 {
            context.coordinator.startLoadIfNeeded(in: host.webView)
        }
    }

    private static var spaceBackground: UIColor {
        UIColor(red: 0.043, green: 0.063, blue: 0.125, alpha: 1) // #0b1020
    }

    /// Navy first-paint only. Not overlay restack; layout stays in WebDist.
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
        var didStartLoad = false
        var httpServer: LoopbackWebServer?

        init(onLoadFailed: ((String) -> Void)?) {
            self.onLoadFailed = onLoadFailed
        }

        func startLoadIfNeeded(in webView: WKWebView) {
            guard !didStartLoad else { return }
            didStartLoad = true
            loadBundledGame(into: webView)
        }

        func loadBundledGame(into webView: WKWebView) {
            guard let root = WebDistRoot(bundle: .main) else {
                onLoadFailed?(
                    "WebDist/index.html missing. From the repo root run: npm run ios:sync"
                )
                return
            }
            let server = LoopbackWebServer(rootURL: root.rootURL)
            do {
                try server.start()
            } catch {
                onLoadFailed?("Loopback server failed: \(error.localizedDescription)")
                return
            }
            httpServer = server
            webView.load(URLRequest(url: server.indexURL))
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
            let host = url.host?.lowercased()
            if (url.scheme == "http" || url.scheme == "https"),
               host == "127.0.0.1" || host == "localhost"
            {
                decisionHandler(.allow)
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

// MARK: - bundled WebDist/

/// Locates `WebDist/` in the app bundle. Does not register `heliopoly://`.
final class WebDistRoot {
    let rootURL: URL

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
}

// MARK: - loopback HTTP (phone only)

/// Serves bundled WebDist over http://127.0.0.1 so WKWebView is a real browser.
/// Custom scheme and loadHTMLString never painted on device.
final class LoopbackWebServer {
    let rootURL: URL
    private var listenFD: Int32 = -1
    private var acceptSource: DispatchSourceRead?
    private(set) var port: UInt16 = 0

    var indexURL: URL {
        URL(string: "http://127.0.0.1:\(port)/index.html")!
    }

    init(rootURL: URL) {
        self.rootURL = rootURL
    }

    deinit { stop() }

    /// Stable origin so WKWebView can reuse HTTP cache across launches.
    private static let preferredPort: UInt16 = 18765

    func start() throws {
        let fd = Darwin.socket(AF_INET, SOCK_STREAM, IPPROTO_TCP)
        guard fd >= 0 else { throw URLError(.cannotConnectToHost) }
        var yes: Int32 = 1
        Darwin.setsockopt(
            fd,
            SOL_SOCKET,
            SO_REUSEADDR,
            &yes,
            socklen_t(MemoryLayout.size(ofValue: yes))
        )
        Darwin.setsockopt(
            fd,
            SOL_SOCKET,
            SO_NOSIGPIPE,
            &yes,
            socklen_t(MemoryLayout.size(ofValue: yes))
        )
        func bindPort(_ p: UInt16) -> Bool {
            var addr = sockaddr_in()
            addr.sin_len = UInt8(MemoryLayout<sockaddr_in>.size)
            addr.sin_family = sa_family_t(AF_INET)
            addr.sin_port = p.bigEndian
            addr.sin_addr = in_addr(s_addr: inet_addr("127.0.0.1"))
            return withUnsafePointer(to: &addr) { ptr in
                ptr.withMemoryRebound(to: sockaddr.self, capacity: 1) { sock in
                    Darwin.bind(fd, sock, socklen_t(MemoryLayout<sockaddr_in>.size)) == 0
                }
            }
        }
        if !bindPort(Self.preferredPort), !bindPort(0) {
            Darwin.close(fd)
            throw URLError(.cannotConnectToHost)
        }
        let flags = Darwin.fcntl(fd, F_GETFL)
        if flags >= 0 {
            _ = Darwin.fcntl(fd, F_SETFL, flags | O_NONBLOCK)
        }
        guard Darwin.listen(fd, 128) == 0 else {
            Darwin.close(fd)
            throw URLError(.cannotConnectToHost)
        }
        var got = sockaddr_in()
        var len = socklen_t(MemoryLayout<sockaddr_in>.size)
        let named = withUnsafeMutablePointer(to: &got) { ptr in
            ptr.withMemoryRebound(to: sockaddr.self, capacity: 1) { sock in
                Darwin.getsockname(fd, sock, &len) == 0
            }
        }
        guard named else {
            Darwin.close(fd)
            throw URLError(.cannotConnectToHost)
        }
        port = UInt16(bigEndian: got.sin_port)
        listenFD = fd
        let src = DispatchSource.makeReadSource(
            fileDescriptor: fd,
            queue: DispatchQueue.global(qos: .userInitiated)
        )
        src.setEventHandler { [weak self] in self?.acceptClients() }
        src.setCancelHandler { Darwin.close(fd) }
        src.resume()
        acceptSource = src
        NSLog("[heliopoly] loopback http://127.0.0.1:%u/", port)
    }

    func stop() {
        acceptSource?.cancel()
        acceptSource = nil
        listenFD = -1
    }

    /// Drain the listen queue. One accept per source event left WKWebView
    /// SYNs waiting until a ~30s timeout (HITL ~35s to Launch).
    private func acceptClients() {
        while true {
            let client = Darwin.accept(listenFD, nil, nil)
            if client < 0 {
                if Darwin.errno == EAGAIN || Darwin.errno == EWOULDBLOCK { return }
                return
            }
            var yes: Int32 = 1
            Darwin.setsockopt(
                client,
                SOL_SOCKET,
                SO_NOSIGPIPE,
                &yes,
                socklen_t(MemoryLayout.size(ofValue: yes))
            )
            DispatchQueue.global(qos: .userInitiated).async {
                self.serve(client)
                Darwin.close(client)
            }
        }
    }

    private func serve(_ fd: Int32) {
        var buf = [UInt8](repeating: 0, count: 16 * 1024)
        let n = Darwin.recv(fd, &buf, buf.count, 0)
        guard n > 0, let req = String(bytes: buf[0..<n], encoding: .utf8) else { return }
        let first = req.split(
            separator: "\r\n",
            maxSplits: 1,
            omittingEmptySubsequences: false
        ).first.map(String.init) ?? ""
        let tokens = first.split(separator: " ")
        guard tokens.count >= 2 else {
            send(fd, status: 400, type: "text/plain", body: Data("bad request".utf8))
            return
        }
        var path = String(tokens[1])
        if let q = path.firstIndex(of: "?") {
            path = String(path[..<q])
        }
        if path.hasPrefix("/") { path.removeFirst() }
        if path.isEmpty { path = "index.html" }
        path = path.removingPercentEncoding ?? path
        if path.contains("..") {
            send(fd, status: 403, type: "text/plain", body: Data("forbidden".utf8))
            return
        }
        let file = rootURL.appendingPathComponent(path).standardizedFileURL
        let rootPath = rootURL.path
        guard file.path == rootPath || file.path.hasPrefix(rootPath + "/") else {
            send(fd, status: 403, type: "text/plain", body: Data("forbidden".utf8))
            return
        }
        guard FileManager.default.fileExists(atPath: file.path),
              let data = try? Data(contentsOf: file)
        else {
            NSLog("[heliopoly] 404 %@", path)
            send(fd, status: 404, type: "text/plain", body: Data("not found".utf8))
            return
        }
        let mime = Self.contentType(for: file)
        NSLog("[heliopoly] 200 %@ mime=%@ bytes=%d", path, mime, data.count)
        send(fd, status: 200, type: mime, body: data)
    }

    private func send(_ fd: Int32, status: Int, type: String, body: Data) {
        let reason: String
        switch status {
        case 200: reason = "OK"
        case 404: reason = "Not Found"
        case 403: reason = "Forbidden"
        default: reason = "Error"
        }
        var header = "HTTP/1.1 \(status) \(reason)\r\n"
        header += "Content-Type: \(type)\r\n"
        header += "Content-Length: \(body.count)\r\n"
        header += "Access-Control-Allow-Origin: *\r\n"
        header += "Cache-Control: public, max-age=86400\r\n"
        header += "Connection: close\r\n\r\n"
        var packet = Data(header.utf8)
        packet.append(body)
        packet.withUnsafeBytes { raw in
            guard let base = raw.bindMemory(to: UInt8.self).baseAddress else { return }
            var sent = 0
            while sent < packet.count {
                let n = Darwin.send(fd, base + sent, packet.count - sent, 0)
                if n <= 0 { break }
                sent += n
            }
        }
    }

    fileprivate static func contentType(for url: URL) -> String {
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
        case "ttf":
            return "font/ttf"
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
