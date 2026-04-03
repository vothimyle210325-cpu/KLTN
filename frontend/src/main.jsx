import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { CssBaseline, ThemeProvider, createTheme, alpha } from "@mui/material";
import App from "./App";
import { store } from "./store";
import "./styles.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1e40af",
      light: "#3b82f6",
      dark: "#1e3a8a",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#0d9488",
      light: "#14b8a6",
      dark: "#0f766e",
      contrastText: "#ffffff"
    },
    success: {
      main: "#059669",
      light: "#10b981",
      dark: "#047857",
      contrastText: "#ffffff"
    },
    warning: {
      main: "#d97706",
      light: "#f59e0b",
      dark: "#b45309",
      contrastText: "#ffffff"
    },
    error: {
      main: "#dc2626",
      light: "#ef4444",
      dark: "#b91c1c",
      contrastText: "#ffffff"
    },
    info: {
      main: "#0284c7",
      light: "#38bdf8",
      dark: "#0369a1",
      contrastText: "#ffffff"
    },
    background: {
      default: "#f0f4f8",
      paper: "#ffffff"
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
      disabled: "#94a3b8"
    },
    divider: "#e2e8f0"
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: '"Be Vietnam Pro", "Segoe UI", "Tahoma", system-ui, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600, lineHeight: 1.4 },
    subtitle2: { fontWeight: 600, lineHeight: 1.4 },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.6 },
    button: { fontWeight: 700, textTransform: "none", letterSpacing: "0.01em" },
    caption: { lineHeight: 1.5, color: "#64748b" },
    overline: { fontWeight: 700, letterSpacing: "0.1em" }
  },
  shadows: [
    "none",
    "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
    "0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04)",
    "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)",
    "0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 10px 10px -5px rgba(15, 23, 42, 0.03)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.15)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.18)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.20)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.22)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.24)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.26)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.28)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.30)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.32)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.34)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.36)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.38)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.40)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.42)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.44)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.46)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.48)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.50)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.52)",
    "0 25px 50px -12px rgba(15, 23, 42, 0.54)"
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": { boxSizing: "border-box" },
        html: { scrollBehavior: "smooth" },
        body: { background: "#f0f4f8" }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
          borderRadius: 16,
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
          "&:hover": {
            boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)"
          }
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "24px",
          "&:last-child": { paddingBottom: 24 }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 700,
          textTransform: "none",
          letterSpacing: "0.01em",
          padding: "9px 20px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        },
        contained: {
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.15)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(30, 64, 175, 0.3)",
            transform: "translateY(-1px)"
          },
          "&:active": {
            transform: "translateY(0)",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.15)"
          }
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(30, 64, 175, 0.1)"
          }
        },
        sizeSmall: {
          padding: "6px 14px",
          fontSize: "0.8125rem",
          borderRadius: 8
        },
        sizeLarge: {
          padding: "12px 28px",
          fontSize: "1rem",
          borderRadius: 12
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: "#f8fafc",
            transition: "all 0.2s",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#94a3b8"
            },
            "&.Mui-focused": {
              backgroundColor: "#ffffff",
              "& .MuiOutlinedInput-notchedOutline": {
                borderWidth: "2px"
              }
            }
          }
        }
      },
      defaultProps: { size: "small" }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 8,
          fontSize: "0.75rem",
          height: 26
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          alignItems: "center"
        },
        standardInfo: {
          backgroundColor: alpha("#0284c7", 0.08),
          color: "#0369a1",
          border: `1px solid ${alpha("#0284c7", 0.2)}`
        },
        standardSuccess: {
          backgroundColor: alpha("#059669", 0.08),
          color: "#047857",
          border: `1px solid ${alpha("#059669", 0.2)}`
        },
        standardWarning: {
          backgroundColor: alpha("#d97706", 0.08),
          color: "#b45309",
          border: `1px solid ${alpha("#d97706", 0.2)}`
        },
        standardError: {
          backgroundColor: alpha("#dc2626", 0.08),
          color: "#b91c1c",
          border: `1px solid ${alpha("#dc2626", 0.2)}`
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
          borderBottom: "1px solid rgba(15, 23, 42, 0.06)"
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: "3px 3px 0 0"
          }
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: "0.875rem",
          textTransform: "none",
          minHeight: 48,
          borderRadius: "10px 10px 0 0",
          transition: "all 0.2s"
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "1px solid #e2e8f0",
          boxShadow: "2px 0 8px rgba(15, 23, 42, 0.04)"
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: "2px 8px",
          padding: "10px 16px",
          transition: "all 0.15s",
          "&:hover": { backgroundColor: alpha("#1e40af", 0.06) },
          "&.Mui-selected": {
            backgroundColor: alpha("#1e40af", 0.1),
            color: "#1e40af",
            "& .MuiListItemIcon-root": { color: "#1e40af" },
            "&:hover": { backgroundColor: alpha("#1e40af", 0.14) }
          }
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
          color: "#64748b"
        }
      }
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          fontFamily: '"Be Vietnam Pro", "Segoe UI", "Tahoma", system-ui, sans-serif',
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f8fafc",
            borderBottom: "2px solid #e2e8f0",
            borderRadius: "12px 12px 0 0"
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 700,
            fontSize: "0.8125rem",
            color: "#334155"
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #f1f5f9",
            fontSize: "0.875rem"
          },
          "& .MuiDataGrid-row": {
            transition: "background-color 0.1s",
            "&:hover": { backgroundColor: "#f8fafc" },
            "&.Mui-selected": { backgroundColor: alpha("#1e40af", 0.04) }
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid #e2e8f0"
          }
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#0f172a",
          fontSize: "0.75rem",
          fontWeight: 600,
          borderRadius: 8,
          padding: "6px 12px"
        },
        arrow: { color: "#0f172a" }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: "#e2e8f0" }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: "0.875rem"
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 6,
          backgroundColor: "#e2e8f0"
        },
        bar: { borderRadius: 6 }
      }
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { borderRadius: 8 }
      }
    }
  }
});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
