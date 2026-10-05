import * as React from "react";
import type { ComplexImageType, ImageType } from "@yext/pages-components";
import {
  MaybeRTF,
  getSurfaceColorStyle,
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
    color,
    buttonBorderRadius = "default",
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
    getThemeColorCssValue(styles.color) ??
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

export const getContrastSurfaceStyle = (
  surfaceColor: ThemeColor,
  streamDocument?: StreamDocument,
): React.CSSProperties => ({
  ...getSurfaceColorStyle(surfaceColor, streamDocument),
  color: isDarkColor(surfaceColor, streamDocument) ? "#fff" : "#000",
});

export const getRichTextStyleOverrides = (
  styles: StyledTextValue,
  fontColor?: ThemeColor,
  surfaceColor?: ThemeColor,
  streamDocument?: StreamDocument,
): NonNullable<MaybeRTFProps["richTextStyleOverrides"]> => ({
  ...styles,
  color:
    (getThemeColorCssValue(fontColor) ? fontColor : undefined) ??
    (getThemeColorCssValue(styles.color) ? styles.color : undefined) ??
    (surfaceColor
      ? isDarkColor(surfaceColor, streamDocument)
        ? "white"
        : "black"
      : undefined),
});

export const renderResolvedRichText = (
  value: unknown,
  richTextStyleOverrides?: MaybeRTFProps["richTextStyleOverrides"],
): React.ReactNode => {
  const textStyles = Object.fromEntries(
    Object.entries(richTextStyleOverrides ?? {}).filter(
      ([property, style]) => property !== "color" && style !== "default" && style !== undefined,
    ),
  );
  const bodyVariables = Object.fromEntries(
    Object.entries(textStyles).map(([property, style]) => [
      `--${property}-body-${property}`,
      style,
    ]),
  );
  const color = richTextStyleOverrides?.color;
  const resolvedColor =
    getThemeColorCssValue(color) ?? (typeof color === "string" ? color : undefined);
  const wrapperStyle = {
    ...textStyles,
    ...bodyVariables,
    ...(resolvedColor ? { color: resolvedColor } : {}),
  };

  // Generated rich-text defaults include inline black text. Remove that
  // boilerplate color on dark surfaces while preserving colors edited in RTF.
  const renderData = (data: RichText | string | undefined) =>
    typeof data === "object" &&
    typeof data.html === "string" &&
    (typeof data.json !== "string" ||
      !/"style":"[^"]*color\s*:/i.test(data.json)) &&
    color === "white"
      ? {
          ...data,
          html: data.html.replace(
            /style="([^"]*)"/g,
            (attribute, declarations: string) => {
              if (!/font-size:\s*14\.67px/i.test(declarations)) {
                return attribute;
              }
              const styles = declarations
                .split(";")
                .filter(
                  (declaration) =>
                    !/^\s*color\s*:\s*(?:rgb\(0,\s*0,\s*0\)|#000000|#000)\s*$/i.test(
                      declaration,
                    ),
                )
                .join(";");
              return styles.trim() ? `style="${styles}"` : "";
            },
          ),
        }
      : data;

  if (React.isValidElement(value)) {
    if (!richTextStyleOverrides) {
      return value;
    }
    if (value.type === MaybeRTF) {
      const element = value as React.ReactElement<MaybeRTFProps>;
      return React.cloneElement(element, {
        data: renderData(element.props.data),
        richTextStyleOverrides: {
          ...element.props.richTextStyleOverrides,
          ...textStyles,
          color,
        },
        style: { ...element.props.style, ...wrapperStyle },
      });
    }

    const element = value as React.ReactElement<{
      style?: React.CSSProperties;
      children?: React.ReactNode;
    }>;
    const child = element.props.children;
    const richTextChild = React.isValidElement(child) &&
      (child.type === MaybeRTF ||
        (typeof child.props.className === "string" &&
          child.props.className.includes("rtf-wrapper")));

    return React.cloneElement(element, {
      style: { ...element.props.style, ...wrapperStyle },
      children: richTextChild
        ? child.type === MaybeRTF
          ? React.cloneElement(child as React.ReactElement<MaybeRTFProps>, {
              data: renderData(child.props.data),
              richTextStyleOverrides: {
                ...child.props.richTextStyleOverrides,
                ...textStyles,
                color,
              },
              style: { ...child.props.style, ...wrapperStyle },
            })
          : React.cloneElement(
              child as React.ReactElement<{ style?: React.CSSProperties }>,
              { style: { ...child.props.style, ...wrapperStyle } },
            )
        : child,
    });
  }

  const data =
    typeof value === "string" ||
    (typeof value === "object" && value !== null && "html" in value)
      ? (value as RichText | string)
      : undefined;

  return (
    <MaybeRTF
      data={renderData(data)}
      richTextStyleOverrides={{ ...textStyles, color }}
      style={wrapperStyle}
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
