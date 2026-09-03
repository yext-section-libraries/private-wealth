import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import {
  Background,
  ComprehensiveCTA,
  createItemSource,
  EntityField,
  getAnalyticsScopeHash,
  getThemeColorCssValue,
  getSurfaceColorStyle,
  isDarkColor,
  getDefaultRTF,
  Image,
  MaybeRTF,
  resolveComponentData,
  toPuckFields,
  useDocument,
  type ComprehensiveCTAValue,
  type RichText,
  type StyledImageValue,
  type StyledTextValue,
  ThemeOptions,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
} from "@yext/visual-editor";
import {
  AnalyticsScopeProvider,
  type ComplexImageType,
  type ImageType,
} from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type StyledTextStyleProps = {
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type SharedImageStyles = {
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type ServiceCardFields = {
  cta: ComprehensiveCTAValue;
  description: YextEntityField<TranslatableRichText>;
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  title: YextEntityField<TranslatableString>;
};

type PrivateWealthFeaturedServicesSectionProps = {
  cardStyles: {
    description: StyledTextStyleProps;
    image: SharedImageStyles;
    title: StyledTextStyleProps;
  };
  cards: typeof featuredServicesSource.value;
  heading: StyledTextProps;
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  sectionCta: ComprehensiveCTAValue;
};

function createDefaultStyledTextValue(): StyledTextValue {
  return {
    fontFamily: "default",
    fontSize: "default",
    fontWeight: "default",
    fontStyle: "default",
    textTransform: "default",
  };
}

function getTextStyles(
  styles: StyledTextValue,
  fontColor?: ThemeColor,
): React.CSSProperties {
  return {
    color: getThemeColorCssValue(fontColor),
    fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
    fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
    fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
    fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
    textTransform:
      styles.textTransform === "default" ? undefined : styles.textTransform,
  };
}

function createDefaultStyledImageValue(): StyledImageValue {
  return {
    borderRadius: "default",
  };
}

function createDefaultComprehensiveCTA(
  label: string,
  link: string,
  variant: "primary" | "link",
  color?: ThemeColor,
): ComprehensiveCTAValue {
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
      color: color,
      button: {
        ...createDefaultStyledTextValue(),
        borderRadius: "lg",
        letterSpacing: "default",
      },
      link: {
        ...createDefaultStyledTextValue(),
        includeCaret: "default",
        letterSpacing: "default",
      },
    },
  };
}

function renderResolvedRichText(
  value: unknown,
  richTextStyleOverrides: Omit<StyledTextValue, "color"> & { color: string },
): React.ReactNode {
  if (React.isValidElement(value)) {
    return value;
  }

  const normalizedValue: RichText | string | undefined =
    typeof value === "string"
      ? value
      : typeof value === "object" && value !== null && "html" in value
        ? (value as RichText)
        : undefined;

  return (
    <MaybeRTF
      data={normalizedValue}
      richTextStyleOverrides={richTextStyleOverrides}
    />
  );
}

const featuredServicesSource = createItemSource<ServiceCardFields>({
  label: "Service Cards",
  mappingFields: {
    title: {
      type: "entityField",
      label: "Title",
      filter: { types: ["type.string"] },
    },
    description: {
      type: "entityField",
      label: "Description",
      filter: { types: ["type.rich_text_v2"] },
    },
    image: {
      type: "entityField",
      label: "Image",
      filter: { types: ["type.image"] },
    },
    cta: {
      label: "CTA",
      type: "comprehensiveCTA",
    },
  },
  defaultValues: [
    {
      title: {
        field: "",
        constantValue: { defaultValue: "Wealth Management" },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Portfolio oversight and account review support for clients seeking ongoing guidance.",
          ),
        },
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
      cta: createDefaultComprehensiveCTA(
        "Schedule a Wealth Review",
        "#",
        "link",
      ),
    },
    {
      title: {
        field: "",
        constantValue: { defaultValue: "Retirement Planning" },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Planning conversations for retirement timelines, income needs, and account coordination.",
          ),
        },
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
      cta: createDefaultComprehensiveCTA(
        "Book a Retirement Consultation",
        "#",
        "link",
      ),
    },
    {
      title: {
        field: "",
        constantValue: { defaultValue: "Investment Management" },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Ongoing investment strategy support based on client objectives and risk considerations.",
          ),
        },
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
      cta: createDefaultComprehensiveCTA(
        "Request an Investment Review",
        "#",
        "link",
      ),
    },
    {
      title: {
        field: "",
        constantValue: { defaultValue: "Financial Planning" },
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Goal-based planning conversations covering cash flow, savings, and long-term priorities.",
          ),
        },
        constantValueEnabled: true,
      },
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
      cta: createDefaultComprehensiveCTA("Speak With an Advisor", "#", "link"),
    },
  ],
});

const privateWealthFeaturedServicesFields: YextFields<PrivateWealthFeaturedServicesSectionProps> =
  {
    section: {
      label: "Section",
      type: "object",
      objectFields: {
        visibleOnLivePage: {
          label: "Visible on Live Page",
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        backgroundColor: {
          label: "Background Color",
          type: "basicSelector",
          options: "BACKGROUND_COLOR",
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
    cards: featuredServicesSource.field,
    cardStyles: {
      label: "Card Styles",
      type: "object",
      objectFields: {
        title: {
          label: "Title Styles",
          type: "object",
          objectFields: {
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
        description: {
          label: "Description Styles",
          type: "object",
          objectFields: {
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
        image: {
          label: "Image Styles",
          type: "object",
          objectFields: {
            aspectRatio: {
              label: "Aspect Ratio",
              type: "select",
              options: ThemeOptions.ASPECT_RATIO,
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
      },
    },
    sectionCta: {
      label: "Section CTA",
      type: "comprehensiveCTA",
    },
  };

/**
 * Renders the featured-services card grid with field-backed title, body,
 * image, CTA, and section background controls.
 *
 * 1. Resolve editor-backed content from the current stream document.
 * 2. Apply the required section background-color contract to the shell.
 * 3. Render card and section actions through `ComprehensiveCTA`.
 */
const PrivateWealthFeaturedServicesSectionComponent: PuckComponent<
  PrivateWealthFeaturedServicesSectionProps
> = ({ cards, cardStyles, heading, id, puck, section, sectionCta }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const scopeName = `YextPrivateWealthFeaturedServicesSection${getAnalyticsScopeHash(
    id,
  )}`;
  const resolvedHeadingValue = resolveComponentData(
    heading.text,
    locale,
    streamDocument,
  );
  const resolvedHeading =
    typeof resolvedHeadingValue === "string" ? resolvedHeadingValue : "";
  const sectionSurfaceStyle = getSurfaceColorStyle(
    section.backgroundColor,
    streamDocument,
  );
  const resolvedCards = featuredServicesSource.resolveItems(
    cards as unknown as typeof featuredServicesSource.value,
    streamDocument,
  );
  const hasDarkBackground = isDarkColor(
    section.backgroundColor,
    streamDocument,
  );
  const cardTitleStyle = getTextStyles(
    cardStyles.title.styles,
    cardStyles.title.fontColor,
  );
  const cardDescriptionStyleOverrides = {
    ...cardStyles.description.styles,
    color:
      getThemeColorCssValue(cardStyles.description.fontColor) ??
      (isDarkColor(section.backgroundColor, streamDocument) ? "#fff" : "#000"),
  };
  const imageWrapperStyle: React.CSSProperties = {
    aspectRatio:
      cardStyles.image.aspectRatio > 0
        ? cardStyles.image.aspectRatio
        : undefined,
    borderRadius:
      cardStyles.image.styles?.borderRadius === "default"
        ? undefined
        : cardStyles.image.styles?.borderRadius,
    overflow:
      cardStyles.image.imageConstrain === "filled" ||
      Boolean(
        cardStyles.image.styles?.borderRadius &&
        cardStyles.image.styles.borderRadius !== "default",
      )
        ? "hidden"
        : undefined,
  };
  const imageStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: cardStyles.image.aspectRatio > 0 ? "100%" : "auto",
    objectFit:
      cardStyles.image.imageConstrain === "filled" ? "cover" : "contain",
  };

  return (
    <VisibilityWrapper
      isEditing={puck.isEditing}
      liveVisibility={section.visibleOnLivePage}
    >
      <style>{`
p { font-family: var(--fontFamily-body-fontFamily); font-size: var(--fontSize-body-fontSize); line-height: 1.5; font-weight: var(--fontWeight-body-fontWeight); font-style: var(--fontStyle-body-fontStyle); text-transform: var(--textTransform-body-textTransform); }
li { font-family: var(--fontFamily-body-fontFamily); font-size: var(--fontSize-body-fontSize); line-height: 1.5; font-weight: var(--fontWeight-body-fontWeight); font-style: var(--fontStyle-body-fontStyle); text-transform: var(--textTransform-body-textTransform); }
h1, h1[class] { font-family: var(--fontFamily-h1-fontFamily); font-size: var(--fontSize-h1-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h1-fontWeight); font-style: var(--fontStyle-h1-fontStyle); text-transform: var(--textTransform-h1-textTransform); }
h2, h2[class] { font-family: var(--fontFamily-h2-fontFamily); font-size: var(--fontSize-h2-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h2-fontWeight); font-style: var(--fontStyle-h2-fontStyle); text-transform: var(--textTransform-h2-textTransform); }
h3, h3[class] { font-family: var(--fontFamily-h3-fontFamily); font-size: var(--fontSize-h3-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h3-fontWeight); font-style: var(--fontStyle-h3-fontStyle); text-transform: var(--textTransform-h3-textTransform); }
h4, h4[class] { font-family: var(--fontFamily-h4-fontFamily); font-size: var(--fontSize-h4-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h4-fontWeight); font-style: var(--fontStyle-h4-fontStyle); text-transform: var(--textTransform-h4-textTransform); }
h5, h5[class] { font-family: var(--fontFamily-h5-fontFamily); font-size: var(--fontSize-h5-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h5-fontWeight); font-style: var(--fontStyle-h5-fontStyle); text-transform: var(--textTransform-h5-textTransform); }
h6, h6[class] { font-family: var(--fontFamily-h6-fontFamily); font-size: var(--fontSize-h6-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h6-fontWeight); font-style: var(--fontStyle-h6-fontStyle); text-transform: var(--textTransform-h6-textTransform); }

      `}</style>
      <AnalyticsScopeProvider name={scopeName}>
        <Background background={section.backgroundColor}>
          <section
            className="px-6 py-16 md:px-8 lg:px-10"
            style={sectionSurfaceStyle}
          >
            <div className="mx-auto max-w-[1600px]">
              <EntityField
                displayName="Heading"
                fieldId={heading.text.field}
                constantValueEnabled={heading.text.constantValueEnabled}
              >
                <h2
                  className="text-center font-serif text-4xl tracking-[-0.04em] md:text-5xl"
                  style={getTextStyles(heading.styles, heading.fontColor)}
                >
                  {resolvedHeading}
                </h2>
              </EntityField>
              <EntityField
                displayName="Service Cards"
                fieldId={cards.field}
                constantValueEnabled={cards.constantValueEnabled}
              >
                <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {resolvedCards.map((card, index) => {
                    const resolvedTitleValue = card.title
                      ? resolveComponentData(card.title, locale, streamDocument)
                      : "";
                    const resolvedTitle =
                      typeof resolvedTitleValue === "string"
                        ? resolvedTitleValue
                        : "";
                    const resolvedDescriptionValue = card.description
                      ? resolveComponentData(
                          card.description,
                          locale,
                          streamDocument,
                          {
                            richTextStyleOverrides:
                              cardDescriptionStyleOverrides,
                          },
                        )
                      : undefined;
                    const resolvedImage = card.image
                      ? resolveComponentData(card.image, locale, streamDocument)
                      : undefined;
                    return (
                      <article key={index} className="flex flex-col">
                        <div className="overflow-hidden">
                          {resolvedImage ? (
                            <div style={imageWrapperStyle}>
                              <Image
                                className="h-full"
                                image={resolvedImage}
                                style={imageStyle}
                              />
                            </div>
                          ) : null}
                        </div>
                        <h3
                          className="mt-4 leading-none tracking-[-0.04em]"
                          style={cardTitleStyle}
                        >
                          {resolvedTitle}
                        </h3>
                        <div className="mt-3 leading-7 opacity-70">
                          {renderResolvedRichText(
                            resolvedDescriptionValue,
                            cardDescriptionStyleOverrides,
                          )}
                        </div>
                        {card.cta ? (
                          <ComprehensiveCTA
                            className={
                              card.cta.styles.variant === "link"
                                ? `mt-4 max-w-full w-fit whitespace-normal break-words border-b pb-1 no-underline transition hover:no-underline ${
                                    hasDarkBackground
                                      ? "border-white/40 hover:border-white"
                                      : "border-current/15 hover:border-current"
                                  }`
                                : "mt-4 max-w-full w-fit whitespace-normal break-words px-6 py-3 text-center transition hover:opacity-90"
                            }
                            eventName={`card${index}`}
                            value={
                              card.cta as unknown as Partial<ComprehensiveCTAValue>
                            }
                          />
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </EntityField>
              <div className="mt-10 flex justify-center">
                <EntityField
                  displayName="Section Call to Action"
                  fieldId={sectionCta.data.cta.field}
                  constantValueEnabled={
                    sectionCta.data.cta.constantValueEnabled
                  }
                >
                  <ComprehensiveCTA
                    className={
                      sectionCta.styles.variant === "link"
                        ? `max-w-full w-fit whitespace-normal break-words border-b pb-1 no-underline transition hover:no-underline ${
                            hasDarkBackground
                              ? "border-white/40 hover:border-white"
                              : "border-current/15 hover:border-current"
                          }`
                        : "max-w-full whitespace-normal break-words px-8 py-3 text-center transition hover:opacity-90"
                    }
                    eventName="primaryCta"
                    value={sectionCta as Partial<ComprehensiveCTAValue>}
                  />
                </EntityField>
              </div>
            </div>
          </section>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PrivateWealthFeaturedServicesSection: YextComponentConfig<PrivateWealthFeaturedServicesSectionProps> =
  {
    label: "Featured Services Section",
    fields: toPuckFields(privateWealthFeaturedServicesFields),
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Featured Services",
          },
          constantValueEnabled: true,
        },
        styles: createDefaultStyledTextValue(),
        fontColor: undefined,
      },
      cardStyles: {
        title: {
          styles: createDefaultStyledTextValue(),
          fontColor: undefined,
        },
        description: {
          styles: createDefaultStyledTextValue(),
          fontColor: undefined,
        },
        image: {
          aspectRatio: 0.67,
          imageConstrain: "fixed",
          styles: createDefaultStyledImageValue(),
        },
      },
      cards: featuredServicesSource.defaultValue,
      sectionCta: createDefaultComprehensiveCTA(
        "Explore Services",
        "#",
        "primary",
        {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
      ),
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "palette-quaternary",
          contrastingColor: "palette-quaternary-contrast",
        },
      },
    },
    render: (props) => (
      <PrivateWealthFeaturedServicesSectionComponent {...props} />
    ),
  };

export const config: SectionConfig = {
  id: "PrivateWealthFeaturedServicesSection",
  displayName: "Featured Services Section",
  description: "Featured Services Section",
  pageSetTypes: ["ENTITY"],
};
