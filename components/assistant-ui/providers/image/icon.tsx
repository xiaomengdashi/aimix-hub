import { useId, type FC, type SVGProps } from "react";
import { cn } from "@/lib/utils";

type ImageLogoProps = SVGProps<SVGSVGElement> & {
  /** 空状态等大尺寸展示 */
  variant?: "icon" | "logo";
};

export const ImageAppIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <ImageAppLogo variant="icon" {...props} />
);

/** 绘图应用品牌图标：渐变画框 + 色块 + 星光 */
export const ImageAppLogo: FC<ImageLogoProps> = ({
  variant = "logo",
  className,
  ...props
}) => {
  const uid = useId().replace(/:/g, "");
  const frame = `${uid}-frame`;
  const shine = `${uid}-shine`;
  const blobA = `${uid}-blob-a`;
  const blobB = `${uid}-blob-b`;
  const blobC = `${uid}-blob-c`;
  const sparkle = `${uid}-sparkle`;

  const isIcon = variant === "icon";

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn(
        isIcon ? "size-5 shrink-0" : "size-14 shrink-0 sm:size-16",
        className,
      )}
      {...props}
    >
      <defs>
        <linearGradient id={frame} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A855F7" />
          <stop offset="0.35" stopColor="#EC4899" />
          <stop offset="0.7" stopColor="#F97316" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id={shine} x1="8" y1="6" x2="24" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <radialGradient
          id={blobA}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(12 14) rotate(25) scale(7 6)"
        >
          <stop stopColor="#C084FC" />
          <stop offset="1" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id={blobB}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(20 18) rotate(-15) scale(6 5)"
        >
          <stop stopColor="#F472B6" />
          <stop offset="1" stopColor="#DB2777" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id={blobC}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(16 11) rotate(40) scale(5 4)"
        >
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={sparkle} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FDE68A" />
          <stop offset="1" stopColor="#F472B6" />
        </linearGradient>
      </defs>

      {/* 外框 */}
      <rect
        x="3"
        y="5"
        width="26"
        height="22"
        rx="5"
        fill={`url(#${frame})`}
      />
      <rect
        x="3.75"
        y="5.75"
        width="24.5"
        height="20.5"
        rx="4.25"
        fill={`url(#${shine})`}
      />

      {/* 内景：色块叠层 */}
      <rect x="6" y="8" width="20" height="16" rx="3" fill="#0f172a" fillOpacity="0.18" />
      <ellipse cx="12" cy="14" rx="7" ry="6" fill={`url(#${blobA})`} />
      <ellipse cx="20" cy="18" rx="6" ry="5" fill={`url(#${blobB})`} />
      <ellipse cx="16" cy="11" rx="5" ry="4" fill={`url(#${blobC})`} />

      {/* 山峦剪影 */}
      <path
        d="M7 21.5 L13 15.5 L17.5 19 L22 14 L25 21.5 Z"
        fill="white"
        fillOpacity="0.92"
      />
      <circle cx="21" cy="11.5" r="2.25" fill="white" fillOpacity="0.95" />

      {/* 星光 */}
      <path
        d="M26.2 6.8l.55 1.65 1.65.55-1.65.55-.55 1.65-.55-1.65-1.65-.55 1.65-.55.55-1.65-.55-1.65 1.65-.55z"
        fill={`url(#${sparkle})`}
      />
      <path
        d="M6.5 7.2l.35 1.05 1.05.35-1.05.35-.35 1.05-.35-1.05-1.05-.35 1.05-.35.35-1.05-.35-1.05 1.05-.35z"
        fill="#FDE68A"
        fillOpacity="0.9"
      />
    </svg>
  );
};
