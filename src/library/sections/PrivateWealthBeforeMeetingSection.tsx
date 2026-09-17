import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import {
  msg,
  Background,
  ComprehensiveCTA,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  Image,
  isDarkColor,
  resolveComponentData,
  useDocument,
  type ComprehensiveCTAValue,
  type YextComponentConfig,
  type YextFields,
  VisibilityWrapper,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
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

type LinkItem = {
  cta: ComprehensiveCTAValue;
};

type PrivateWealthBeforeMeetingSectionProps = {
  body: StyledRtfProps;
  heading: StyledTextProps;
  image: StyledImageProps;
  links: LinkItem[];
  section: SectionProps;
};

const privateWealthBeforeMeetingFields: YextFields<PrivateWealthBeforeMeetingSectionProps> =
  {
    section: {
      label: msg("fields.section", "Section"),
      type: "object",
      objectFields: {
        visibleOnLivePage: {
          label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
          type: "radio",
          options: [
            { label: msg("fields.options.yes", "Yes"), value: true },
            { label: msg("fields.options.no", "No"), value: false },
          ],
        },
        backgroundColor: {
          label: msg("fields.backgroundColor", "Background Color"),
          type: "basicSelector",
          options: "BACKGROUND_COLOR",
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
    image: {
      label: msg("fields.image", "Image"),
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
    links: {
      label: msg("fields.links", "Links"),
      type: "array",
      defaultItemProps: {
        cta: createDefaultComprehensiveCTA("Link", { variant: "link" }),
      },
      getItemSummary: (item) =>
        String(item.cta?.data?.cta?.constantValue?.label || "Link"),
      arrayFields: {
        cta: {
          label: msg("fields.callToAction", "Call to Action"),
          type: "comprehensiveCTA",
        },
      },
    },
  };

/**
 * Renders the pre-meeting promo band with field-backed heading, body, image,
 * CTA-link list, and section background controls.
 *
 * 1. Resolve editor-backed content from the current stream document.
 * 2. Apply the required section background-color contract to the visible shell.
 * 3. Render the visible resource links through `ComprehensiveCTA`.
 */
const PrivateWealthBeforeMeetingSectionComponent: PuckComponent<
  PrivateWealthBeforeMeetingSectionProps
> = ({ body, heading, id, image, links, puck, section }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const scopeName = `YextPrivateWealthBeforeMeetingSection${getAnalyticsScopeHash(
    id,
  )}`;
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
  const resolvedHeading =
    typeof resolvedHeadingValue === "string" ? resolvedHeadingValue : "";
  const resolvedImage = resolveComponentData(
    image.image,
    locale,
    streamDocument,
  );
  const sectionSurfaceStyle = getSurfaceColorStyle(
    section.backgroundColor,
    streamDocument,
  );
  const hasDarkBackground = isDarkColor(
    section.backgroundColor,
    streamDocument,
  );
  const imageWrapperStyle = {
    aspectRatio: image.aspectRatio > 0 ? image.aspectRatio : undefined,
    borderRadius:
      image.styles?.borderRadius === "default"
        ? undefined
        : image.styles?.borderRadius,
    overflow:
      image.imageConstrain === "filled" ||
      Boolean(
        image.styles?.borderRadius && image.styles.borderRadius !== "default",
      )
        ? "hidden"
        : undefined,
  };
  const imageStyle = {
    display: "block",
    width: "100%",
    height: image.aspectRatio > 0 ? "100%" : "auto",
    objectFit:
      image.imageConstrain === "filled"
        ? ("cover" as const)
        : ("contain" as const),
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
            <div className="mx-auto grid max-w-[1600px] items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
              <div className="order-1 rounded-lg p-4 md:order-2 md:p-6">
                {resolvedImage ? (
                  <EntityField
                    displayName="Image"
                    fieldId={image.image.field}
                    constantValueEnabled={image.image.constantValueEnabled}
                  >
                    <div style={imageWrapperStyle}>
                      <Image
                        className="h-full"
                        image={resolvedImage}
                        style={imageStyle}
                      />
                    </div>
                  </EntityField>
                ) : null}
              </div>
              <div className="order-2 text-center md:order-1">
                <EntityField
                  displayName="Heading"
                  fieldId={heading.text.field}
                  constantValueEnabled={heading.text.constantValueEnabled}
                >
                  <h2
                    className="font-serif text-4xl tracking-[-0.04em] md:text-5xl"
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
                <EntityField
                  displayName="Body"
                  fieldId={body.text.field}
                  constantValueEnabled={body.text.constantValueEnabled}
                >
                  <div className="mx-auto mt-5 max-w-[46ch] text-sm leading-7 md:text-base">
                    {renderResolvedRichText(
                      resolvedBodyValue,
                      bodyRichTextStyleOverrides,
                    )}
                  </div>
                </EntityField>
                <div aria-hidden="true" className="mt-5 text-xl leading-none">
                  ✦
                </div>
                <div className="mt-8 flex flex-col items-center gap-3 text-sm">
                  {links.map((link, index) => (
                    <EntityField
                      key={index}
                      displayName={`Link ${index + 1}`}
                      fieldId={link.cta.data.cta.field}
                      constantValueEnabled={
                        link.cta.data.cta.constantValueEnabled
                      }
                    >
                      <ComprehensiveCTA
                        className={
                          link.cta.styles.variant === "link"
                            ? `max-w-full w-fit whitespace-normal break-words border-b pb-1 no-underline transition hover:no-underline ${
                                hasDarkBackground
                                  ? "border-white/40 hover:border-white"
                                  : "border-current/15 hover:border-current"
                              }`
                            : "max-w-full whitespace-normal break-words text-center"
                        }
                        eventName={`link${index}`}
                        value={link.cta as Partial<ComprehensiveCTAValue>}
                      />
                    </EntityField>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PrivateWealthBeforeMeetingSection: YextComponentConfig<PrivateWealthBeforeMeetingSectionProps> =
  {
    label: msg("components.beforeMeetingSection", "Before Meeting Section"),
    fields: privateWealthBeforeMeetingFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Before You Meet With Us",
          },
          constantValueEnabled: true,
        },
        styles: createDefaultStyledTextValue(),
        fontColor: undefined,
      },
      body: {
        text: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "Prospective clients can review advisor credentials, disclosures, and service information before scheduling a consultation. Additional regulatory and advisory disclosures are available through the links below.",
            ),
          },
          constantValueEnabled: true,
        },
        styles: createDefaultStyledTextValue(),
        fontColor: undefined,
      },
      image: {
        image: {
          field: "",
          constantValue: {
            url: "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
            width: 1267,
            height: 1900,
          },
          constantValueEnabled: true,
        },
        aspectRatio: 0.67,
        imageConstrain: "fixed",
        styles: createDefaultStyledImageValue(),
      },
      links: [
        {
          cta: createDefaultComprehensiveCTA("Advisory disclosures", {
            variant: "link",
          }),
        },
        {
          cta: createDefaultComprehensiveCTA("Regulatory information", {
            variant: "link",
          }),
        },
        {
          cta: createDefaultComprehensiveCTA("Privacy policy", {
            variant: "link",
          }),
        },
        {
          cta: createDefaultComprehensiveCTA("FINRA BrokerCheck", {
            variant: "link",
          }),
        },
      ],
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
      },
    },
    render: (props) => (
      <PrivateWealthBeforeMeetingSectionComponent {...props} />
    ),
  };

export const config: SectionConfig = {
  id: "PrivateWealthBeforeMeetingSection",
  displayName: "Before Meeting Section",
  description: "Before Meeting Section",
  pageSetTypes: ["ENTITY"],
};
