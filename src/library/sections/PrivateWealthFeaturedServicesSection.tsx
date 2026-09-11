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
  resolveComponentData,
  useDocument,
  type ComprehensiveCTAValue,
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
import {
  aspectRatioOptions,
  baseTypographyCss,
  createDefaultComprehensiveCTA,
  createDefaultStyledImageValue,
  createDefaultStyledTextValue,
  getTextStyles,
  renderResolvedRichText,
  type ImageStyleProps,
  type SectionProps,
  type StyledTextProps,
  type StyledTextStyleProps,
} from "../shared/sectionHelpers";

type ServiceCardFields = {
  cta: ComprehensiveCTAValue;
  description: YextEntityField<TranslatableRichText>;
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  title: YextEntityField<TranslatableString>;
};

type PrivateWealthFeaturedServicesSectionProps = {
  cardStyles: {
    description: StyledTextStyleProps;
    image: ImageStyleProps;
    title: StyledTextStyleProps;
  };
  cards: typeof featuredServicesSource.value;
  heading: StyledTextProps;
  section: SectionProps;
  sectionCta: ComprehensiveCTAValue;
};

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
        { variant: "link" },
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
        { variant: "link" },
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
        { variant: "link" },
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
      cta: createDefaultComprehensiveCTA("Speak With an Advisor", {
        variant: "link",
      }),
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
      <style>{baseTypographyCss}</style>
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
    fields: privateWealthFeaturedServicesFields,
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
        {
          variant: "primary",
          color: {
            selectedColor: "palette-tertiary",
            contrastingColor: "palette-tertiary-contrast",
          },
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
