import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import {
  msg,
  Background,
  ComprehensiveCTA,
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
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
  baseTypographyCss,
  createDefaultComprehensiveCTA,
  createDefaultStyledTextValue,
  getTextStyles,
  type SectionProps,
  type StyledTextProps,
} from "../shared/sectionHelpers";

type FooterLinkItem = {
  cta: ComprehensiveCTAValue;
};

type PrivateWealthFooterProps = {
  brandLabel: StyledTextProps;
  links: FooterLinkItem[];
  section: SectionProps;
};

const privateWealthFooterFields: YextFields<PrivateWealthFooterProps> = {
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
  brandLabel: {
    label: msg("fields.brandLabel", "Brand Label"),
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
  links: {
    label: msg("fields.links", "Links"),
    type: "array",
    defaultItemProps: {
      cta: createDefaultComprehensiveCTA("Link", {
        variant: "link",
        includeCaret: "none",
      }),
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
 * Renders the footer shell with field-backed brand text and CTA-based footer links.
 *
 * 1. Resolve the footer label from the current stream document.
 * 2. Apply the required section background-color contract to the footer shell.
 * 3. Render the visible footer actions through `ComprehensiveCTA`.
 */
const PrivateWealthFooterComponent: PuckComponent<PrivateWealthFooterProps> = ({
  brandLabel,
  id,
  links,
  puck,
  section,
}) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const scopeName = `YextPrivateWealthFooter${getAnalyticsScopeHash(id)}`;
  const resolvedBrandLabelValue = resolveComponentData(
    brandLabel.text,
    locale,
    streamDocument,
  );
  const resolvedBrandLabel =
    typeof resolvedBrandLabelValue === "string" ? resolvedBrandLabelValue : "";
  const sectionSurfaceStyle = getSurfaceColorStyle(
    section.backgroundColor,
    streamDocument,
  );
  const hasDarkBackground = isDarkColor(
    section.backgroundColor,
    streamDocument,
  );

  return (
    <VisibilityWrapper
      isEditing={puck.isEditing}
      liveVisibility={section.visibleOnLivePage}
    >
      <style>{baseTypographyCss}</style>
      <AnalyticsScopeProvider name={scopeName}>
        <Background background={section.backgroundColor}>
          <footer
            className="px-6 py-6 md:px-8 lg:px-10"
            style={sectionSurfaceStyle}
          >
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:gap-8 md:text-left">
              <EntityField
                displayName="Brand Label"
                fieldId={brandLabel.text.field}
                constantValueEnabled={brandLabel.text.constantValueEnabled}
              >
                <div
                  className="font-serif text-2xl tracking-[-0.04em]"
                  style={getTextStyles(
                    brandLabel.styles,
                    brandLabel.fontColor,
                    section.backgroundColor,
                    streamDocument,
                  )}
                >
                  {resolvedBrandLabel}
                </div>
              </EntityField>
              <ul className="flex min-w-0 flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm md:flex-1 md:justify-start md:text-left">
                {links.map((link, index) => (
                  <li key={index}>
                    <EntityField
                      displayName={`Footer Link ${index + 1}`}
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
                        eventName={`footerlink${index}`}
                        value={link.cta as Partial<ComprehensiveCTAValue>}
                      />
                    </EntityField>
                  </li>
                ))}
              </ul>
            </div>
          </footer>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PrivateWealthFooter: YextComponentConfig<PrivateWealthFooterProps> =
  {
    label: msg("components.footer", "Footer"),
    fields: privateWealthFooterFields,
    defaultProps: {
      brandLabel: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "[[name]]",
          },
          constantValueEnabled: true,
        },
        styles: createDefaultStyledTextValue(),
        fontColor: undefined,
      },
      links: [
        {
          cta: createDefaultComprehensiveCTA("Locations", {
            variant: "link",
            includeCaret: "none",
          }),
        },
        {
          cta: createDefaultComprehensiveCTA("Services", {
            variant: "link",
            includeCaret: "none",
          }),
        },
        {
          cta: createDefaultComprehensiveCTA("Advisors", {
            variant: "link",
            includeCaret: "none",
          }),
        },
        {
          cta: createDefaultComprehensiveCTA("Disclosures", {
            variant: "link",
            includeCaret: "none",
          }),
        },
        {
          cta: createDefaultComprehensiveCTA("Contact", {
            variant: "link",
            includeCaret: "none",
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
    render: (props) => <PrivateWealthFooterComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "PrivateWealthFooter",
  displayName: "Footer",
  description: "Footer",
  pageSetTypes: ["ENTITY", "DIRECTORY", "LOCATOR"],
};
