//
//  ContentView.swift
//  HeliopolyPhone
//
//  iPhone prototype root (#126 / #148). Gold bar + WebDist + PhoneOverlay.
//  iPad uses Heliopoly/GameWebView.swift (never injects overlay).
//

import SwiftUI

struct PhoneContentView: View {
    @State private var loadError: String?

    var body: some View {
        VStack(spacing: 0) {
            Text("HELIOPOLY PHONE · THUMBS · 3")
                .font(.system(size: 13, weight: .bold, design: .rounded))
                .tracking(1.2)
                .foregroundStyle(Color(red: 0.043, green: 0.063, blue: 0.125))
                .frame(maxWidth: .infinity)
                .padding(.top, 54)
                .padding(.bottom, 10)
                .background(Color(red: 1, green: 0.784, blue: 0.341))

            ZStack {
                Color(red: 0.043, green: 0.063, blue: 0.125)
                    .allowsHitTesting(false)
                if let loadError {
                    errorPanel(message: loadError)
                } else {
                    GameWebView(injectPhoneOverlay: true) { message in
                        loadError = message
                    }
                    .allowsHitTesting(true)
                }
            }
        }
        .ignoresSafeArea(edges: .top)
        .preferredColorScheme(.dark)
    }

    @ViewBuilder
    private func errorPanel(message: String) -> some View {
        VStack(spacing: 16) {
            Text("HELIOPOLY PHONE")
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundStyle(Color(red: 1, green: 0.784, blue: 0.341))
                .tracking(2)

            Text("Prototype overlay · iPad app is unchanged")
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
