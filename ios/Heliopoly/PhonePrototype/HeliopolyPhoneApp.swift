//
//  HeliopolyPhoneApp.swift
//  HeliopolyPhone
//
//  Isolated iPhone prototype shell (#120 / #121).
//  Not compiled into the iPad Heliopoly target.
//

import SwiftUI

@main
struct HeliopolyPhoneApp: App {
    var body: some Scene {
        WindowGroup {
            PhoneContentView()
                .preferredColorScheme(.dark)
        }
    }
}
