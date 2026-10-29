//! macOS-only helpers: Liquid Glass backdrop and the system accent color.

use std::ffi::c_void;

use objc2::rc::{Allocated, Retained};
use objc2::runtime::AnyClass;
use objc2::{msg_send, sel};
use objc2_app_kit::{NSAutoresizingMaskOptions, NSColor, NSColorSpace, NSView, NSWindow, NSWindowOrderingMode};

/// `NSGlassEffectView` ships with macOS 26. Looked up at runtime so the app
/// still builds against older SDKs and falls back to vibrancy on older systems.
fn glass_class() -> Option<&'static AnyClass> {
    AnyClass::get(c"NSGlassEffectView")
}

pub fn liquid_glass_available() -> bool {
    glass_class().is_some()
}

/// Insert a Liquid Glass view behind the webview, filling the window.
///
/// # Safety
/// `ns_window` must be a valid `NSWindow` pointer and this must run on the main thread.
pub unsafe fn install_liquid_glass(ns_window: *mut c_void, corner_radius: f64) -> bool {
    let Some(cls) = glass_class() else { return false };
    let window = &*(ns_window as *const NSWindow);
    let Some(content) = window.contentView() else { return false };

    let alloc: Allocated<NSView> = msg_send![cls, alloc];
    let glass: Retained<NSView> = msg_send![alloc, initWithFrame: content.bounds()];
    glass.setAutoresizingMask(
        NSAutoresizingMaskOptions::ViewWidthSizable | NSAutoresizingMaskOptions::ViewHeightSizable,
    );
    let has_radius: bool = msg_send![&*glass, respondsToSelector: sel!(setCornerRadius:)];
    if has_radius {
        let _: () = msg_send![&*glass, setCornerRadius: corner_radius];
    }
    content.addSubview_positioned_relativeTo(&glass, NSWindowOrderingMode::Below, None);
    true
}

/// The user's accent color (System Settings → Appearance) as `#rrggbb`.
pub fn accent_hex() -> Option<String> {
    let color = NSColor::controlAccentColor();
    let srgb = color.colorUsingColorSpace(&NSColorSpace::sRGBColorSpace())?;
    let channel = |v: f64| (v.clamp(0.0, 1.0) * 255.0).round() as u8;
    Some(format!(
        "#{:02x}{:02x}{:02x}",
        channel(srgb.redComponent()),
        channel(srgb.greenComponent()),
        channel(srgb.blueComponent()),
    ))
}
