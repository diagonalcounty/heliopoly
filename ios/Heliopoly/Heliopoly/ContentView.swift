//
//  ContentView.swift
//  Heliopoly
//
//  Root shell: offline bundled game + recovery UI if WebDist is missing.
//

import SwiftUI

struct ContentView: View {
    @State private var loadError: String?

    var body: some View {
        ZStack {
            Color(red: 0.043, green: 0.063, blue: 0.125)
                .ignoresSafeArea()

            if let loadError {
                errorPanel(message: loadError)
            } else {
                // Do NOT ignoreSafeArea on the web view — WKWebView reports
                // zero insets when edge-to-edge, so CSS safe-area padding fails
                // and Lab/title sit under the status bar / Dynamic Island.
                // Background color still fills the notch; chrome stays in-bounds.
                GameWebView { message in
                    loadError = message
                }
            }
        }
    }

    @ViewBuilder
    private func errorPanel(message: String) -> some View {
        VStack(spacing: 16) {
            Text("HELIOPOLY")
                .font(.system(size: 28, weight: .bold, design: .rounded))
                .foregroundStyle(Color(red: 1, green: 0.784, blue: 0.341))
                .tracking(2)

            Text("Orbital Economics")
                .font(.subheadline)
                .foregroundStyle(Color(red: 0.604, green: 0.659, blue: 0.78))

            Text(message)
                .font(.footnote.monospaced())
                .foregroundStyle(Color(red: 0.9, green: 0.42, blue: 0.48))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)

            Text("In Terminal: cd ~/code/heliopoly && npm run ios:sync\nThen rebuild in Xcode.")
                .font(.caption)
                .foregroundStyle(Color(red: 0.604, green: 0.659, blue: 0.78))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
        }
        .padding(32)
    }
}

#Preview {
    ContentView()
}
