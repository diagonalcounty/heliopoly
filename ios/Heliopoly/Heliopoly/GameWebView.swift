//
//  GameWebView.swift
//  Heliopoly
//
//  Loads the packaged Vite build from WebDist/ (offline, not a remote site).
//

import SwiftUI
import WebKit

/// Full-screen game surface: local `WebDist/index.html` via WKWebView.
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

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.isOpaque = false
        webView.backgroundColor = Self.spaceBackground
        webView.scrollView.backgroundColor = Self.spaceBackground
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.bounces = false
        webView.allowsBackForwardNavigationGestures = false

        // Pinch-zoom off — game is touch-laid out for the viewport.
        webView.scrollView.minimumZoomScale = 1
        webView.scrollView.maximumZoomScale = 1

        context.coordinator.loadBundledGame(into: webView)
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        context.coordinator.onLoadFailed = onLoadFailed
    }

    private static var spaceBackground: UIColor {
        UIColor(red: 0.043, green: 0.063, blue: 0.125, alpha: 1) // #0b1020
    }

    final class Coordinator: NSObject, WKNavigationDelegate {
        var onLoadFailed: ((String) -> Void)?

        init(onLoadFailed: ((String) -> Void)?) {
            self.onLoadFailed = onLoadFailed
        }

        func loadBundledGame(into webView: WKWebView) {
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

        /// Keep navigation inside the bundle (no silent jump to external sites).
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
            // Telemetry / optional https — open outside the game shell if needed.
            if url.scheme == "http" || url.scheme == "https" {
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.cancel)
        }
    }
}
