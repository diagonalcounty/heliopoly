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
            if let loadError {
                errorPanel(message: loadError)
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
    private func errorPanel(message: String) -> some View {
        VStack(spacing: 16) {
            Text("HELIOPOLY PHONE")
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundStyle(Color(red: 1, green: 0.784, blue: 0.341))
                .tracking(2)

            Text("Same WebDist a skinny browser sees · iPad app is unchanged")
                .font(.subheadline)
                .foregroundStyle(Color(red: 0.604, green: 0.659, blue: 0.78))

            Text(message)
                .font(.footnote.monospaced())
                .foregroundStyle(Color(red: 0.9, green: 0.42, blue: 0.48))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)

            Text("In Terminal: cd ~/code/heliopoly && npm run ios:sync\nThen rebuild the HeliopolyPhone scheme.")
                .font(.caption)
                .foregroundStyle(Color(red: 0.604, green: 0.659, blue: 0.78))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
        }
        .padding(32)
    }
}

#Preview {
    PhoneContentView()
}
