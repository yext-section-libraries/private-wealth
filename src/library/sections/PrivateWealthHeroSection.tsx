import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import {
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
    label: "Section",
    type: "object",
    objectFields: {
      backgroundColor: {
        label: "Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      visibleOnLivePage: {
        label: "Visible On Live Page",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  heading: {
    label: "Heading",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: {
          types: ["type.string"],
        },
      },
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  body: {
    label: "Body",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: {
          types: ["type.rich_text_v2"],
        },
      },
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  heroImage: {
    label: "Hero Image",
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: "Image",
        filter: {
          types: ["type.image"],
        },
      },
      aspectRatio: {
        label: "Aspect Ratio",
        type: "select",
        options: aspectRatioOptions,
      },
      imageConstrain: {
        label: "Image Constrain",
        type: "select",
        options: [
          { label: "Fixed", value: "fixed" },
          { label: "Filled", value: "filled" },
        ],
      },
      styles: {
        label: "Image Styles",
        type: "styledImage",
      },
    },
  },
  hours: {
    type: "entityField",
    label: "Hours",
    filter: {
      types: ["type.hours"],
    },
    disableConstantValueToggle: true,
  },
  hoursStyles: {
    label: "Hours Styles",
    type: "object",
    objectFields: {
      showCurrentStatus: {
        label: "Show Current Status",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      timeFormat: {
        label: "Time Format",
        type: "select",
        options: [
          { label: "12 Hour", value: "12h" },
          { label: "24 Hour", value: "24h" },
        ],
      },
      dayOfWeekFormat: {
        label: "Day Of Week Format",
        type: "select",
        options: [
          { label: "Short", value: "short" },
          { label: "Long", value: "long" },
        ],
      },
      showDayNames: {
        label: "Show Day Names",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  primaryCta: {
    label: "Primary CTA",
    type: "comprehensiveCTA",
  },
  secondaryCta: {
    label: "Secondary CTA",
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
    const interval = params.isOpen
      ? params.currentInterval
      : params.futureInterval;
    const time = params.isOpen
      ? interval?.getEndTime(locale, params.timeOptions)
      : interval?.getStartTime(locale, params.timeOptions);
    const dayOfWeek = hoursStyles.showDayNames
      ? params.isOpen
        ? interval?.end?.setLocale(locale).toLocaleString(params.dayOptions)
        : interval?.start?.setLocale(locale).toLocaleString(params.dayOptions)
      : "";

    return (
      <div className="flex items-center gap-1 text-sm font-semibold">
        <span
          aria-hidden="true"
          className="h-[0.7rem] w-[0.7rem] shrink-0 rounded-full mr-1"
          style={{
            backgroundColor: params.isOpen ? "#4caf50" : "#f44336",
            boxShadow: params.isOpen
              ? "0 0 0 0.22rem rgba(76 175 80 / 0.18)"
              : "0 0 0 0.22rem rgba(244 67 54 / 0.18)",
          }}
        />
        <span>{params.isOpen ? "Open Now:" : "Closed:"}</span>
        {time ? (
          <span>
            {params.isOpen ? `Closes at ${time}` : `Opens at ${time}`}
          </span>
        ) : null}
        {dayOfWeek ? <span>{dayOfWeek}</span> : null}
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
    label: "Hero Section",
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
      primaryCta: createDefaultComprehensiveCTA(
        "Schedule Consultation",
        { variant: "primary" },
      ),
      secondaryCta: createDefaultComprehensiveCTA(
        "Get Directions",
        { variant: "secondary" },
      ),
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
