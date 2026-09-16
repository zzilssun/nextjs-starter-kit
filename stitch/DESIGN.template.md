---
version: alpha
name: Enterprise Design System
description: Official design tokens and components specification for Enterprise Next.js Platform.
colors:
  primary: "#2563EB"
  primary-hover: "#1D4ED8"
  primary-active: "#1E40AF"
  primary-light: "#EFF6FF"
  secondary: "#4B5563"
  neutral: "#F8F9FA"
  surface: "#FFFFFF"
  text-primary: "#111827"
  text-secondary: "#4B5563"
  border: "#E5E7EB"
  success: "#047857"
  warning: "#B45309"
  error: "#DC2626"
  info: "#2563EB"
typography:
  h1:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 24px
    fontWeight: 700
    lineHeight: 2rem
  h2:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.75rem
  h3:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.75rem
  body:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.25rem
  caption:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1rem
  button:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.25rem
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  2xl: 24px
  full: 9999px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    height: 40px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    height: 40px
  button-destructive:
    backgroundColor: "{colors.error}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    height: 40px
  input:
    textColor: "{colors.text-primary}"
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    height: 40px
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
  stats-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.2xl}"
  badge-neutral:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.full}"
---
