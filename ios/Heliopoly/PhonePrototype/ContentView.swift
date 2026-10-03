//
//  ContentView.swift
//  HeliopolyPhone
//
//  iPhone host (#180). WKWebView fills the device. No gold fingerprint bar.
//  Notch / home indicator are CSS env(safe-area-inset-*). Loopback is #176.
//  iPad uses Heliopoly/GameWebView.swift.
//

import SwiftUI

struct PhoneContentView: View {
    @State private var loadError: String?

    var body: some View {
        ZStack {
            Color(red: 0.043, green: 0.063, blue: 0.125)
                .ignoresSafeArea()
                .allowsHitTesting(false)
            if loadError != nil {
                errorPanel()
            } else {
                GameWebView { message in
                    loadError = message
                }
                .ignoresSafeArea()
                .allowsHitTesting(true)
            }
        }
        .ignoresSafeArea()
        .preferredColorScheme(.dark)
        .statusBarHidden(false)
    }

    @ViewBuilder
    private func errorPanel() -> some View {
        VStack(spacing: 16) {
            Text("HELIOPOLY PHONE")
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundStyle(Color(red: 1, green: 0.784, blue: 0.341))
                .tracking(2)

            Text("The game did not load.")
                .font(.footnote.monospaced())
                .foregroundStyle(Color(red: 0.9, green: 0.42, blue: 0.48))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
        }
        .padding(32)
    }
}

#Preview {
    PhoneContentView()
}
