import { Box } from "@mui/material";

/** Logo chính thức HCMUTE (ĐH SPKT TP.HCM) — file trong `public/hcmute-logo.png` */
export const HCMUTE_LOGO_SRC = "/hcmute-logo.png";

export const HCMUTE_BRAND = {
  short: "HCMUTE",
  fullVi: "Đại học Sư phạm Kỹ thuật TP. Hồ Chí Minh",
  fullEn: "Ho Chi Minh City University of Technology and Education"
};

/**
 * @param {object} props
 * @param {number} [props.height]
 * @param {import("@mui/material").SxProps} [props.sx]
 * @param {boolean} [props.onDarkBackground] — true: thêm nền trắng bo góc để logo nổi trên nền xanh/gradient
 */
export function HcmuteLogo({ height = 44, onDarkBackground = false, sx = {} }) {
  return (
    <Box
      component="img"
      src={HCMUTE_LOGO_SRC}
      alt={`${HCMUTE_BRAND.fullVi} (${HCMUTE_BRAND.short})`}
      sx={{
        height,
        width: "auto",
        maxWidth: "100%",
        objectFit: "contain",
        display: "block",
        ...(onDarkBackground
          ? {
              bgcolor: "rgba(255,255,255,0.96)",
              borderRadius: 2,
              px: 0.75,
              py: 0.5,
              boxShadow: "0 2px 12px rgba(0,0,0,0.12)"
            }
          : {}),
        ...sx
      }}
    />
  );
}
