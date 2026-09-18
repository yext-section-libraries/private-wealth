import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import {
  msg,
  Background,
  ComprehensiveCTA,
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  getDefaultRTF,
  Image,
  isDarkColor,
  resolveComponentData,
  useDocument,
  type ComprehensiveCTAValue,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
} from "@yext/visual-editor";
import {
  AnalyticsScopeProvider,
  HoursStatus,
  type HoursType,
  type StatusParams,
} from "@yext/pages-components";
import {
  aspectRatioOptions,
  baseTypographyCss,
  createDefaultComprehensiveCTA,
  createDefaultStyledImageValue,
  createDefaultStyledTextValue,
  getRichTextStyleOverrides,
  getTextStyles,
  renderResolvedRichText,
  type SectionProps,
  type StyledImageProps,
  type StyledRtfProps,
  type StyledTextProps,
} from "../shared/sectionHelpers";

type HoursStatusStyles = {
  showCurrentStatus: boolean;
  timeFormat: "12h" | "24h";
  dayOfWeekFormat: "short" | "long";
  showDayNames: boolean;
};

type PrivateWealthHeroSectionProps = {
  body: StyledRtfProps;
  heading: StyledTextProps;
  heroImage: StyledImageProps;
  hours: YextEntityField<HoursType>;
  hoursStyles: HoursStatusStyles;
  primaryCta: ComprehensiveCTAValue;
  secondaryCta: ComprehensiveCTAValue;
  section: SectionProps;
};

const privateWealthHeroFields: YextFields<PrivateWealthHeroSectionProps> = {
  section: {
    label: msg("fields.section", "Section"),
    type: "object",
    objectFields: {
      backgroundColor: {
        label: msg("fields.backgroundColor", "Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      visibleOnLivePage: {
        label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
    },
  },
  heading: {
    label: msg("fields.heading", "Heading"),
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: msg("fields.text", "Text"),
        filter: {
          types: ["type.string"],
        },
      },
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText",
      },
      fontColor: {
        label: msg("fields.fontColor", "Font Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  body: {
    label: msg("fields.body", "Body"),
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: msg("fields.text", "Text"),
        filter: {
          types: ["type.rich_text_v2"],
        },
      },
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText",
      },
      fontColor: {
        label: msg("fields.fontColor", "Font Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  heroImage: {
    label: msg("fields.heroImage", "Hero Image"),
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: msg("fields.image", "Image"),
        filter: {
          types: ["type.image"],
        },
      },
      aspectRatio: {
        label: msg("fields.aspectRatio", "Aspect Ratio"),
        type: "select",
        options: aspectRatioOptions,
      },
      imageConstrain: {
        label: msg("fields.imageConstrain", "Image Constrain"),
        type: "select",
        options: [
          { label: msg("fields.options.fixed", "Fixed"), value: "fixed" },
          { label: msg("fields.options.filled", "Filled"), value: "filled" },
        ],
      },
      styles: {
        label: msg("fields.imageStyles", "Image Styles"),
        type: "styledImage",
      },
    },
  },
  hours: {
    type: "entityField",
    label: msg("fields.hours", "Hours"),
    filter: {
      types: ["type.hours"],
    },
    disableConstantValueToggle: true,
  },
  hoursStyles: {
    label: msg("fields.hoursStyles", "Hours Styles"),
    type: "object",
    objectFields: {
      showCurrentStatus: {
        label: msg("fields.showCurrentStatus", "Show Current Status"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
      timeFormat: {
        label: msg("fields.timeFormat", "Time Format"),
        type: "select",
        options: [
          { label: msg("fields.options.hour12Label", "12 Hour"), value: "12h" },
          { label: msg("fields.options.hour24Label", "24 Hour"), value: "24h" },
        ],
      },
      dayOfWeekFormat: {
        label: msg("fields.dayOfWeekFormat", "Day of Week Format"),
        type: "select",
        options: [
          { label: msg("fields.options.short", "Short"), value: "short" },
          { label: msg("fields.options.long", "Long"), value: "long" },
        ],
      },
      showDayNames: {
        label: msg("fields.showDayNames", "Show Day Names"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
    },
  },
  primaryCta: {
    label: msg("fields.primaryCta", "Primary CTA"),
    type: "comprehensiveCTA",
  },
  secondaryCta: {
    label: msg("fields.secondaryCta", "Secondary CTA"),
    type: "comprehensiveCTA",
  },
};

/**
 * Renders the hero band using the required built-in field contracts for text,
 * rich text, image, CTA, section background, and hours status.
 *
 * 1. Resolve editor-backed content from the current stream document.
 * 2. Apply the section background-color contract to the visible hero shell.
 * 3. Render the status line through `HoursStatus` instead of hardcoded copy.
 */
const PrivateWealthHeroSectionComponent: PuckComponent<
  PrivateWealthHeroSectionProps
> = ({
  body,
  heading,
  heroImage,
  hours,
  hoursStyles,
  id,
  primaryCta,
  puck,
  secondaryCta,
  section,
}) => {
  const { t, i18n } = useTranslation();
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const scopeName = `YextPrivateWealthHeroSection${getAnalyticsScopeHash(id)}`;
  const resolvedHeadingValue = resolveComponentData(
    heading.text,
    locale,
    streamDocument,
  );
  const bodyRichTextStyleOverrides = getRichTextStyleOverrides(
    body.styles,
    body.fontColor,
    section.backgroundColor,
    streamDocument,
  );
  const resolvedBodyValue = resolveComponentData(
    body.text,
    locale,
    streamDocument,
  );
  const resolvedHeroImage = resolveComponentData(
    heroImage.image,
    locale,
    streamDocument,
  );
  const resolvedHours = resolveComponentData(hours, locale, streamDocument);
  const resolvedHeading =
    typeof resolvedHeadingValue === "string" ? resolvedHeadingValue : "";
  const sectionSurfaceStyle = getSurfaceColorStyle(
    section.backgroundColor,
    streamDocument,
  );
  const hasDarkBackground = isDarkColor(
    section.backgroundColor,
    streamDocument,
  );
  const imageWrapperStyle = {
    aspectRatio: heroImage.aspectRatio > 0 ? heroImage.aspectRatio : undefined,
    borderRadius:
      heroImage.styles?.borderRadius === "default"
        ? undefined
        : heroImage.styles?.borderRadius,
    overflow:
      heroImage.imageConstrain === "filled" ||
      Boolean(
        heroImage.styles?.borderRadius &&
        heroImage.styles.borderRadius !== "default",
      )
        ? "hidden"
        : undefined,
  };
  const imageStyle = {
    display: "block",
    width: "100%",
    height: heroImage.aspectRatio > 0 ? "100%" : "auto",
    objectFit:
      heroImage.imageConstrain === "filled"
        ? ("cover" as const)
        : ("contain" as const),
  };
  const timeOptions = { hour12: hoursStyles.timeFormat === "12h" };
  const dayOptions = { weekday: hoursStyles.dayOfWeekFormat } as const;

  const renderHoursStatus = (params: StatusParams): React.ReactNode => {
    const isComingSoon = !!params.comingSoon;
    const isOpen24Hours = !!params.currentInterval?.is24h?.();
    const isIndefinitelyClosed = !params.futureInterval;
    const hasFutureStatus = !isOpen24Hours && !isIndefinitelyClosed;
    const interval = params.isOpen
      ? params.currentInterval
      : params.futureInterval;
    const time = params.isOpen
      ? (interval?.getEndTime(i18n.language, params.timeOptions) ?? "")
      : (interval?.getStartTime(i18n.language, params.timeOptions) ?? "");
    const dayOfWeek = hoursStyles.showDayNames
      ? params.isOpen
        ? (interval?.end
            ?.setLocale(i18n.language)
            .toLocaleString(params.dayOptions) ?? "")
        : (interval?.start
            ?.setLocale(i18n.language)
            .toLocaleString(params.dayOptions) ?? "")
      : "";
    const currentStatus = isComingSoon
      ? t("comingSoon", "Coming Soon")
      : isOpen24Hours
        ? t("open24Hours", "Open 24 Hours")
        : isIndefinitelyClosed
          ? t("temporarilyClosed", "Temporarily Closed")
          : params.isOpen
            ? t("openNow", "Open Now")
            : t("closed", "Closed");
    const futureStatus =
      !isComingSoon && hasFutureStatus && time
        ? params.isOpen
          ? dayOfWeek
            ? t("closesAtTimeWeek", "Closes at {{time}} {{dayOfWeek}}", {
                time,
                dayOfWeek,
              })
            : t("closesAtTime", "Closes at {{time}}", { time })
          : dayOfWeek
            ? t("opensAtTimeWeek", "Opens at {{time}} {{dayOfWeek}}", {
                time,
                dayOfWeek,
              })
            : t("opensAtTime", "Opens at {{time}}", { time })
        : "";

    return (
      <div className="flex items-center gap-1 text-sm font-semibold">
        <span
          aria-hidden="true"
          className="h-[0.7rem] w-[0.7rem] shrink-0 rounded-full mr-1"
          style={{
            backgroundColor:
              params.isOpen && !isComingSoon ? "#4caf50" : "#f44336",
            boxShadow:
              params.isOpen && !isComingSoon
                ? "0 0 0 0.22rem rgba(76 175 80 / 0.18)"
                : "0 0 0 0.22rem rgba(244 67 54 / 0.18)",
          }}
        />
        {(hoursStyles.showCurrentStatus || isComingSoon) && (
          <span className="HoursStatus-current">{currentStatus}</span>
        )}
        {hoursStyles.showCurrentStatus && futureStatus ? (
          <span className="HoursStatus-separator"> • </span>
        ) : null}
        {futureStatus ? (
          <span className="HoursStatus-future">{futureStatus}</span>
        ) : null}
      </div>
    );
  };

  return (
    <VisibilityWrapper
      isEditing={puck.isEditing}
      liveVisibility={section.visibleOnLivePage}
    >
      <style>{baseTypographyCss}</style>
      <AnalyticsScopeProvider name={scopeName}>
        <Background background={section.backgroundColor}>
          <section
            className="px-6 py-10 md:px-8 md:py-14 lg:px-10 lg:py-16"
            style={sectionSurfaceStyle}
          >
            <div className="mx-auto grid max-w-[1600px] items-center gap-10 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:gap-12 lg:gap-16">
              <div className="order-2 flex flex-col items-center text-center md:order-1">
                <EntityField
                  displayName="Heading"
                  fieldId={heading.text.field}
                  constantValueEnabled={heading.text.constantValueEnabled}
                >
                  <h2
                    className="max-w-[12ch] font-serif text-[2.4rem] leading-[0.95] tracking-[-0.05em] md:text-[3.25rem] lg:text-[4.25rem]"
                    style={getTextStyles(
                      heading.styles,
                      heading.fontColor,
                      section.backgroundColor,
                      streamDocument,
                    )}
                  >
                    {resolvedHeading}
                  </h2>
                </EntityField>
                {resolvedHours && hoursStyles.showCurrentStatus ? (
                  <EntityField
                    displayName="Hours"
                    fieldId={hours.field}
                    constantValueEnabled={hours.constantValueEnabled}
                  >
                    <div className="mt-5">
                      <HoursStatus
                        hours={resolvedHours}
                        timezone={streamDocument.timezone ?? "UTC"}
                        comingSoon={streamDocument.comingSoon}
                        timeOptions={timeOptions}
                        dayOptions={dayOptions}
                        statusTemplate={renderHoursStatus}
                      />
                    </div>
                  </EntityField>
                ) : null}
                <div aria-hidden="true" className="mt-5 text-xl leading-none">
                  ✦
                </div>
                <EntityField
                  displayName="Body"
                  fieldId={body.text.field}
                  constantValueEnabled={body.text.constantValueEnabled}
                >
                  <div className="mt-5 max-w-[44ch] text-sm leading-7 md:text-base">
                    {renderResolvedRichText(
                      resolvedBodyValue,
                      bodyRichTextStyleOverrides,
                    )}
                  </div>
                </EntityField>
                <div className="mt-7 flex flex-col items-center justify-center gap-3">
                  <EntityField
                    displayName="Primary Call to Action"
                    fieldId={primaryCta.data.cta.field}
                    constantValueEnabled={
                      primaryCta.data.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      className={
                        primaryCta.styles.variant === "link"
                          ? `max-w-full w-fit whitespace-normal break-words border-b pb-1 no-underline transition hover:no-underline ${
                              hasDarkBackground
                                ? "border-white/40 hover:border-white"
                                : "border-current/15 hover:border-current"
                            }`
                          : "max-w-full whitespace-normal break-words px-7 py-3 text-center transition hover:opacity-90"
                      }
                      eventName="primaryCta"
                      value={primaryCta as Partial<ComprehensiveCTAValue>}
                    />
                  </EntityField>
                  <EntityField
                    displayName="Secondary Call to Action"
                    fieldId={secondaryCta.data.cta.field}
                    constantValueEnabled={
                      secondaryCta.data.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      className={
                        secondaryCta.styles.variant === "link"
                          ? `max-w-full w-fit whitespace-normal break-words border-b pb-1 no-underline transition hover:no-underline ${
                              hasDarkBackground
                                ? "border-white/40 hover:border-white"
                                : "border-current/15 hover:border-current"
                            }`
                          : "max-w-full whitespace-normal break-words px-7 py-3 text-center transition hover:opacity-90"
                      }
                      eventName="secondaryCta"
                      value={secondaryCta as Partial<ComprehensiveCTAValue>}
                    />
                  </EntityField>
                </div>
              </div>

              <div className="order-1 mx-auto max-w-[620px] md:order-2 md:max-w-none">
                {resolvedHeroImage ? (
                  <EntityField
                    displayName="Hero Image"
                    fieldId={heroImage.image.field}
                    constantValueEnabled={heroImage.image.constantValueEnabled}
                  >
                    <div style={imageWrapperStyle}>
                      <Image
                        className="h-full"
                        image={resolvedHeroImage}
                        style={imageStyle}
                      />
                    </div>
                  </EntityField>
                ) : null}
              </div>
            </div>
          </section>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PrivateWealthHeroSection: YextComponentConfig<PrivateWealthHeroSectionProps> =
  {
    label: msg("components.heroSection", "Hero Section"),
    fields: privateWealthHeroFields,
    defaultProps: {
      heading: {
        text: {
          field: "name",
          constantValue: {
            defaultValue: "",
          },
          constantValueEnabled: false,
        },
        styles: createDefaultStyledTextValue(),
        fontColor: undefined,
      },
      body: {
        text: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "[[name]] - [[geomodifier]] [[address.city]] provides wealth management, retirement planning, and financial advisory services for individuals, families, and business owners across the [[address.city]] metro area.",
            ),
          },
          constantValueEnabled: true,
        },
        styles: createDefaultStyledTextValue(),
        fontColor: undefined,
      },
      heroImage: {
        image: {
          field: "",
          constantValue: {
            url: "https://a.mktgcdn.com/p/vQqhmnexQfZueJGyh5M_j5W4EcTkTyZlW93eIoqjjvQ/1900x1267.jpg",
            width: 1900,
            height: 1267,
          },
          constantValueEnabled: true,
        },
        aspectRatio: 1.5,
        imageConstrain: "fixed",
        styles: createDefaultStyledImageValue(),
      },
      hours: {
        field: "hours",
        constantValue: {},
        constantValueEnabled: false,
      },
      hoursStyles: {
        showCurrentStatus: true,
        timeFormat: "12h",
        dayOfWeekFormat: "long",
        showDayNames: false,
      },
      primaryCta: createDefaultComprehensiveCTA("Schedule Consultation", {
        variant: "primary",
      }),
      secondaryCta: createDefaultComprehensiveCTA("Get Directions", {
        variant: "secondary",
      }),
      section: {
        visibleOnLivePage: true,
        backgroundColor: { selectedColor: "white", contrastingColor: "black" },
      },
    },
    render: (props) => <PrivateWealthHeroSectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "PrivateWealthHeroSection",
  displayName: "Hero Section",
  description: "Hero Section",
  pageSetTypes: ["ENTITY"],
};
