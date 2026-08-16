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

    func makeCoordinator() -> Coordinator {
        Coordinator(onLoadFailed: onLoadFailed)
    }

    func makeUIView(context: Context) -> WKWebView {
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
        }

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        // JS alert/confirm/prompt are silent without WKUIDelegate (#111).
        webView.uiDelegate = context.coordinator
        webView.isOpaque = false
        webView.backgroundColor = Self.spaceBackground
        webView.scrollView.backgroundColor = Self.spaceBackground
        // Let CSS safe-area-inset-* handle notches; avoid double padding.
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        // #95: no whole-page rubber-band / pinch; log scrolls inside the page.
        webView.scrollView.bounces = false
        webView.scrollView.alwaysBounceVertical = false
        webView.scrollView.alwaysBounceHorizontal = false
        webView.scrollView.bouncesZoom = false
        webView.allowsBackForwardNavigationGestures = false
        // Match page to device width (critical for iPad layout CSS).
        webView.scrollView.contentInset = .zero
        webView.scrollView.scrollIndicatorInsets = .zero

        // Pinch-zoom off — game is touch-laid out for the viewport (#95).
        webView.scrollView.minimumZoomScale = 1
        webView.scrollView.maximumZoomScale = 1
        webView.scrollView.pinchGestureRecognizer?.isEnabled = false
        if #available(iOS 16.4, *) {
            webView.isInspectable = true
        }

        context.coordinator.loadBundledGame(into: webView)
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        context.coordinator.onLoadFailed = onLoadFailed
    }

    private static var spaceBackground: UIColor {
        UIColor(red: 0.043, green: 0.063, blue: 0.125, alpha: 1) // #0b1020
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        var onLoadFailed: ((String) -> Void)?
        /// Retained for the life of the web view (configuration also retains it).
        var schemeHandler: WebDistSchemeHandler?
        var useCustomScheme = false

        init(onLoadFailed: ((String) -> Void)?) {
            self.onLoadFailed = onLoadFailed
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
            webView.evaluateJavaScript(
                """
                document.documentElement.classList.add('native-shell');
                if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
                  document.documentElement.classList.add('touch-ui');
                }
                // Mirror viewport scale lock if meta is stale.
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
