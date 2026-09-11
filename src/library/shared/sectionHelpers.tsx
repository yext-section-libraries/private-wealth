import * as React from "react";
import type { ComplexImageType, ImageType } from "@yext/pages-components";
import {
  MaybeRTF,
  getThemeColorCssValue,
  isDarkColor,
  type ComprehensiveCTAValue,
  type MaybeRTFProps,
  type RichText,
  type StreamDocument,
  type StyledImageValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextEntityField,
} from "@yext/visual-editor";

export type SectionProps = {
  backgroundColor: ThemeColor;
  visibleOnLivePage: boolean;
};

export type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

export type StyledTextStyleProps = {
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

export type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

export type StyledImageProps = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

export type ImageStyleProps = Omit<StyledImageProps, "image">;

/** Numeric options formerly exposed by the Visual Editor ASPECT_RATIO preset. */
export const aspectRatioOptions = [
  { label: "1:1", value: 1 },
  { label: "5:4", value: 1.25 },
  { label: "4:3", value: 1.33 },
  { label: "3:2", value: 1.5 },
  { label: "5:3", value: 1.67 },
  { label: "16:9", value: 1.78 },
  { label: "2:1", value: 2 },
  { label: "3:1", value: 3 },
  { label: "4:1", value: 4 },
  { label: "4:5", value: 0.8 },
  { label: "3:4", value: 0.75 },
  { label: "2:3", value: 0.67 },
];

export const bodyTypographyCss = `
p { font-family: var(--fontFamily-body-fontFamily); font-size: var(--fontSize-body-fontSize); line-height: 1.5; font-weight: var(--fontWeight-body-fontWeight); font-style: var(--fontStyle-body-fontStyle); text-transform: var(--textTransform-body-textTransform); }
li { font-family: var(--fontFamily-body-fontFamily); font-size: var(--fontSize-body-fontSize); line-height: 1.5; font-weight: var(--fontWeight-body-fontWeight); font-style: var(--fontStyle-body-fontStyle); text-transform: var(--textTransform-body-textTransform); }
`;

export const headingTypographyCss = `
h1, h1[class] { font-family: var(--fontFamily-h1-fontFamily); font-size: var(--fontSize-h1-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h1-fontWeight); font-style: var(--fontStyle-h1-fontStyle); text-transform: var(--textTransform-h1-textTransform); }
h2, h2[class] { font-family: var(--fontFamily-h2-fontFamily); font-size: var(--fontSize-h2-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h2-fontWeight); font-style: var(--fontStyle-h2-fontStyle); text-transform: var(--textTransform-h2-textTransform); }
h3, h3[class] { font-family: var(--fontFamily-h3-fontFamily); font-size: var(--fontSize-h3-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h3-fontWeight); font-style: var(--fontStyle-h3-fontStyle); text-transform: var(--textTransform-h3-textTransform); }
h4, h4[class] { font-family: var(--fontFamily-h4-fontFamily); font-size: var(--fontSize-h4-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h4-fontWeight); font-style: var(--fontStyle-h4-fontStyle); text-transform: var(--textTransform-h4-textTransform); }
h5, h5[class] { font-family: var(--fontFamily-h5-fontFamily); font-size: var(--fontSize-h5-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h5-fontWeight); font-style: var(--fontStyle-h5-fontStyle); text-transform: var(--textTransform-h5-textTransform); }
h6, h6[class] { font-family: var(--fontFamily-h6-fontFamily); font-size: var(--fontSize-h6-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h6-fontWeight); font-style: var(--fontStyle-h6-fontStyle); text-transform: var(--textTransform-h6-textTransform); }
`;

export const baseTypographyCss = `${bodyTypographyCss}${headingTypographyCss}`;

export const createDefaultStyledTextValue = (): StyledTextValue => ({
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
});

export const createDefaultStyledImageValue = (
  borderRadius = "default",
): StyledImageValue => ({ borderRadius });

type DefaultCtaOptions = {
  link?: string;
  variant?: "primary" | "secondary" | "link";
  color?: ThemeColor;
  buttonBorderRadius?: string;
  includeCaret?: "default" | "none";
};

export const createDefaultComprehensiveCTA = (
  label: string,
  options: DefaultCtaOptions = {},
): ComprehensiveCTAValue => {
  const {
    link = "#",
    variant = "primary",
    color =
      variant === "link"
        ? undefined
        : {
            selectedColor: "palette-tertiary",
            contrastingColor: "palette-tertiary-contrast",
          },
    buttonBorderRadius = "lg",
    includeCaret = "default",
  } = options;

  return {
    data: {
      actionType: "link",
      cta: {
        field: "",
        constantValue: {
          label,
          link,
          linkType: "URL",
          ctaType: "textAndLink",
          openInNewTab: false,
          normalizeLink: false,
        },
        constantValueEnabled: true,
        selectedType: "textAndLink",
      },
      openInNewTab: false,
    },
    styles: {
      variant,
      color,
      button: {
        ...createDefaultStyledTextValue(),
        borderRadius: buttonBorderRadius,
        letterSpacing: "default",
      },
      link: {
        ...createDefaultStyledTextValue(),
        includeCaret,
        letterSpacing: "default",
      },
    },
  };
};

export const getTextStyles = (
  styles: StyledTextValue,
  fontColor?: ThemeColor,
  surfaceColor?: ThemeColor,
  streamDocument?: StreamDocument,
): React.CSSProperties => ({
  color:
    getThemeColorCssValue(fontColor) ??
    (surfaceColor
      ? isDarkColor(surfaceColor, streamDocument)
        ? "#fff"
        : "#000"
      : undefined),
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});

export const getRichTextStyleOverrides = (
  styles: StyledTextValue,
  fontColor?: ThemeColor,
  surfaceColor?: ThemeColor,
  streamDocument?: StreamDocument,
): NonNullable<MaybeRTFProps["richTextStyleOverrides"]> => ({
  ...styles,
  color:
    getThemeColorCssValue(fontColor) ??
    (surfaceColor
      ? isDarkColor(surfaceColor, streamDocument)
        ? "#fff"
        : "#000"
      : undefined),
});

export const renderResolvedRichText = (
  value: unknown,
  richTextStyleOverrides?: MaybeRTFProps["richTextStyleOverrides"],
): React.ReactNode => {
  if (React.isValidElement(value)) {
    if (!richTextStyleOverrides) {
      return value;
    }

    const resolvedColor = getThemeColorCssValue(richTextStyleOverrides.color);
    const { color: _color, ...styleOverrides } = richTextStyleOverrides;
    const element = value as React.ReactElement<{
      style?: React.CSSProperties;
    }>;

    return React.cloneElement(element, {
      style: {
        ...element.props.style,
        ...styleOverrides,
        ...(resolvedColor ? { color: resolvedColor } : {}),
      },
    });
  }

  const data =
    typeof value === "string" ||
    (typeof value === "object" && value !== null && "html" in value)
      ? (value as RichText | string)
      : undefined;

  return (
    <MaybeRTF
      data={data}
      richTextStyleOverrides={richTextStyleOverrides}
    />
  );
};

export const isRichTextEmpty = (value: unknown): boolean => {
  if (!value) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (typeof value === "object" && "html" in value) {
    const html = (value as { html?: unknown }).html;
    return typeof html !== "string" || html.trim() === "";
  }

  return false;
};
