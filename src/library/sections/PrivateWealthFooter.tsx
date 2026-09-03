import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import {
  Background,
  ComprehensiveCTA,
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  isDarkColor,
  resolveComponentData,
  toPuckFields,
  useDocument,
  type ComprehensiveCTAValue,
  type StreamDocument,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type FooterLinkItem = {
  cta: ComprehensiveCTAValue;
};

type PrivateWealthFooterProps = {
  brandLabel: StyledTextProps;
  links: FooterLinkItem[];
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
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
  fontColor: ThemeColor | undefined,
  surfaceColor: ThemeColor,
  streamDocument: StreamDocument,
): React.CSSProperties {
  return {
    color:
      getThemeColorCssValue(fontColor) ??
      (isDarkColor(surfaceColor, streamDocument) ? "#fff" : "#000"),
    fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
    fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
    fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
    fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
    textTransform:
      styles.textTransform === "default" ? undefined : styles.textTransform,
  };
}

function createDefaultComprehensiveCTA(label: string): ComprehensiveCTAValue {
  return {
    data: {
      actionType: "link",
      cta: {
        field: "",
        constantValue: {
          label,
          link: "#",
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
      variant: "link",
      color: undefined,
      button: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
        borderRadius: "lg",
        letterSpacing: "default",
      },
      link: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
        includeCaret: "none",
        letterSpacing: "default",
      },
    },
  } satisfies ComprehensiveCTAValue;
}

const privateWealthFooterFields: YextFields<PrivateWealthFooterProps> = {
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
  brandLabel: {
    label: "Brand Label",
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
  links: {
    label: "Links",
    type: "array",
    defaultItemProps: {
      cta: createDefaultComprehensiveCTA("Link"),
    },
    getItemSummary: (item) =>
      String(item.cta?.data?.cta?.constantValue?.label || "Link"),
    arrayFields: {
      cta: {
        label: "Call to Action",
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
const PrivateWealthFooterComponent: PuckComponent<
  PrivateWealthFooterProps
> = ({ brandLabel, id, links, puck, section }) => {
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
    label: "Footer",
    fields: toPuckFields(privateWealthFooterFields),
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
        { cta: createDefaultComprehensiveCTA("Locations") },
        { cta: createDefaultComprehensiveCTA("Services") },
        { cta: createDefaultComprehensiveCTA("Advisors") },
        { cta: createDefaultComprehensiveCTA("Disclosures") },
        { cta: createDefaultComprehensiveCTA("Contact") },
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
