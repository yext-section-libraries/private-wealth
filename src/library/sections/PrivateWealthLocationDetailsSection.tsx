import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { parsePhoneNumber } from "awesome-phonenumber";
import type { PuckComponent } from "@puckeditor/core";
import {
  Background,
  ComprehensiveCTA,
  EntityField,
  getDefaultRTF,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  isDarkColor,
  MaybeRTF,
  resolveComponentData,
  toPuckFields,
  useDocument,
  type ComprehensiveCTAValue,
  type RichText,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
} from "@yext/visual-editor";
import {
  AnalyticsScopeProvider,
  Address,
  HoursTable,
  Link,
  type AddressType,
  type DayOfWeekNames,
  type HoursType,
} from "@yext/pages-components";

type StyledTextStyleProps = {
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type PhoneItemProps = {
  number: YextEntityField<string>;
  label: string;
};

type PhoneFieldProps = {
  items: PhoneItemProps[];
  phoneFormat: "international" | "domestic";
  includeHyperlink?: boolean;
};

type HoursStyles = {
  startOfWeek: keyof DayOfWeekNames | "today";
  collapseDays: boolean;
};

type PrivateWealthLocationDetailsSectionProps = {
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
  sectionHeading: StyledTextProps;
  informationCard: {
    title: YextEntityField<TranslatableString>;
    addressSubheading: YextEntityField<TranslatableString>;
    address: {
      address: YextEntityField<AddressType>;
      showCountry: boolean;
      showRegion: boolean;
    };
    phones: PhoneFieldProps;
    emails: {
      subheading: YextEntityField<TranslatableString>;
      list: YextEntityField<TranslatableString[]>;
    };
    nmlsSubheading: YextEntityField<TranslatableString>;
    nmlsValue: YextEntityField<TranslatableString>;
    primaryCta: ComprehensiveCTAValue;
    secondaryCta: ComprehensiveCTAValue;
  };
  hoursCard: {
    title: YextEntityField<TranslatableString>;
    hours: YextEntityField<HoursType>;
    hoursStyles: HoursStyles;
  };
  servicesCard: {
    title: YextEntityField<TranslatableString>;
    languagesSubheading: YextEntityField<TranslatableString>;
    languagesText: YextEntityField<TranslatableString[]>;
    accessibilitySubheading: YextEntityField<TranslatableString>;
    accessibilityText: YextEntityField<TranslatableRichText>;
    servicesSubheading: YextEntityField<TranslatableString>;
    servicesItems: YextEntityField<TranslatableString[]>;
  };
  cards: {
    backgroundColor: ThemeColor;
    titleStyles: StyledTextStyleProps;
    subheadingStyles: StyledTextStyleProps;
    contentStyles: StyledTextStyleProps;
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

function createDefaultComprehensiveCTA(
  label: string,
  link: string,
  variant: "primary" | "secondary",
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
      color: {
        selectedColor: "palette-tertiary",
        contrastingColor: "palette-tertiary-contrast",
      },
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

function formatPhoneNumber(
  phoneNumberString: string,
  format: "domestic" | "international",
): string {
  const cleanedPhoneNumberString = phoneNumberString.replace(
    /(?!^\+)\+|[^\d+]/g,
    "",
  );
  const parsedPhoneNumber = parsePhoneNumber(cleanedPhoneNumberString);

  if (!parsedPhoneNumber.valid || parsedPhoneNumber.number === undefined) {
    return phoneNumberString;
  }

  return format === "international"
    ? parsedPhoneNumber.number.international
    : parsedPhoneNumber.number.national;
}

function normalizeResolvedStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

const privateWealthLocationDetailsFields: YextFields<PrivateWealthLocationDetailsSectionProps> =
  {
    section: {
      label: "Section",
      type: "object",
      objectFields: {
        visibleOnLivePage: {
          label: "Visible On Live Page",
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
    sectionHeading: {
      label: "Section Heading",
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
    informationCard: {
      label: "Information Card",
      type: "object",
      objectFields: {
        title: {
          type: "entityField",
          label: "Title",
          filter: {
            types: ["type.string"],
          },
        },
        addressSubheading: {
          type: "entityField",
          label: "Address Subheading",
          filter: {
            types: ["type.string"],
          },
        },
        address: {
          label: "Address",
          type: "object",
          objectFields: {
            address: {
              type: "entityField",
              label: "Address",
              filter: {
                types: ["type.address"],
              },
            },
            showRegion: {
              label: "Show Region",
              type: "radio",
              options: [
                { label: "Yes", value: true },
                { label: "No", value: false },
              ],
            },
            showCountry: {
              label: "Show Country",
              type: "radio",
              options: [
                { label: "Yes", value: true },
                { label: "No", value: false },
              ],
            },
          },
        },
        phones: {
          label: "Phones",
          type: "object",
          objectFields: {
            items: {
              label: "Items",
              type: "array",
              defaultItemProps: {
                number: {
                  field: "",
                  constantValue: "",
                  constantValueEnabled: true,
                },
                label: "",
              },
              getItemSummary: (item) =>
                item.label ||
                item.number?.constantValue ||
                item.number?.field ||
                "Phone",
              arrayFields: {
                number: {
                  type: "entityField",
                  label: "Number",
                  filter: {
                    types: ["type.phone"],
                  },
                },
                label: {
                  label: "Label",
                  type: "text",
                },
              },
            },
            phoneFormat: {
              label: "Phone Format",
              type: "radio",
              options: [
                { label: "Domestic", value: "domestic" },
                { label: "International", value: "international" },
              ],
            },
            includeHyperlink: {
              label: "Include Hyperlink",
              type: "radio",
              options: [
                { label: "Yes", value: true },
                { label: "No", value: false },
              ],
            },
          },
        },
        emails: {
          label: "Emails",
          type: "object",
          objectFields: {
            subheading: {
              type: "entityField",
              label: "Subheading",
              filter: {
                types: ["type.string"],
              },
            },
            list: {
              type: "entityField",
              label: "Emails",
              filter: {
                types: ["type.string"],
                includeListsOnly: true,
                allowList: ["emails"],
              },
              disallowTranslation: true,
            },
          },
        },
        nmlsSubheading: {
          type: "entityField",
          label: "NMLS Subheading",
          filter: {
            types: ["type.string"],
          },
        },
        nmlsValue: {
          type: "entityField",
          label: "NMLS Value",
          filter: {
            types: ["type.string"],
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
      },
    },
    hoursCard: {
      label: "Hours Card",
      type: "object",
      objectFields: {
        title: {
          type: "entityField",
          label: "Title",
          filter: {
            types: ["type.string"],
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
            startOfWeek: {
              label: "Start Of Week",
              type: "select",
              options: [
                { label: "Monday", value: "monday" },
                { label: "Tuesday", value: "tuesday" },
                { label: "Wednesday", value: "wednesday" },
                { label: "Thursday", value: "thursday" },
                { label: "Friday", value: "friday" },
                { label: "Saturday", value: "saturday" },
                { label: "Sunday", value: "sunday" },
                { label: "Today", value: "today" },
              ],
            },
            collapseDays: {
              label: "Collapse Days",
              type: "radio",
              options: [
                { label: "Yes", value: true },
                { label: "No", value: false },
              ],
            },
          },
        },
      },
    },
    servicesCard: {
      label: "Services Card",
      type: "object",
      objectFields: {
        title: {
          type: "entityField",
          label: "Title",
          filter: {
            types: ["type.string"],
          },
        },
        languagesSubheading: {
          type: "entityField",
          label: "Languages Subheading",
          filter: {
            types: ["type.string"],
          },
        },
        languagesText: {
          type: "entityField",
          label: "Languages Text",
          filter: {
            types: ["type.string"],
            includeListsOnly: true,
          },
        },
        accessibilitySubheading: {
          type: "entityField",
          label: "Accessibility Subheading",
          filter: {
            types: ["type.string"],
          },
        },
        accessibilityText: {
          type: "entityField",
          label: "Accessibility Text",
          filter: {
            types: ["type.rich_text_v2"],
          },
        },
        servicesSubheading: {
          type: "entityField",
          label: "Services Subheading",
          filter: {
            types: ["type.string"],
          },
        },
        servicesItems: {
          type: "entityField",
          label: "Services Items",
          filter: {
            types: ["type.string"],
            includeListsOnly: true,
          },
        },
      },
    },
    cards: {
      label: "Cards",
      type: "object",
      objectFields: {
        backgroundColor: {
          label: "Background Color",
          type: "basicSelector",
          options: "BACKGROUND_COLOR",
        },
        titleStyles: {
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
        subheadingStyles: {
          label: "Subheading Styles",
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
        contentStyles: {
          label: "Body Styles",
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
      },
    },
  };

/**
 * Renders the location-details band with contract-backed address, phone,
 * email, hours, CTA, text-list, and section/card background fields.
 *
 * 1. Resolve editor-backed text and entity-backed contact data from the stream document.
 * 2. Apply the required section and card background-color contracts.
 * 3. Render hours with `HoursTable` instead of custom rows.
 */
const PrivateWealthLocationDetailsSectionComponent: PuckComponent<
  PrivateWealthLocationDetailsSectionProps
> = ({
  cards,
  hoursCard,
  id,
  informationCard,
  puck,
  section,
  sectionHeading,
  servicesCard,
}) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const {
    address,
    addressSubheading,
    emails,
    nmlsSubheading,
    nmlsValue,
    phones,
    primaryCta,
    secondaryCta,
    title: informationTitle,
  } = informationCard;
  const { hours, hoursStyles, title: hoursTitle } = hoursCard;
  const {
    accessibilitySubheading,
    accessibilityText,
    languagesSubheading,
    languagesText,
    servicesItems,
    servicesSubheading,
    title: servicesTitle,
  } = servicesCard;
  const scopeName = `YextPrivateWealthLocationDetailsSection${getAnalyticsScopeHash(
    id,
  )}`;
  const resolvedSectionHeadingValue = resolveComponentData(
    sectionHeading.text,
    locale,
    streamDocument,
  );
  const resolvedInformationTitleValue = resolveComponentData(
    informationTitle,
    locale,
    streamDocument,
  );
  const resolvedHoursTitleValue = resolveComponentData(
    hoursTitle,
    locale,
    streamDocument,
  );
  const resolvedServicesTitleValue = resolveComponentData(
    servicesTitle,
    locale,
    streamDocument,
  );
  const resolvedAddressSubheadingValue = resolveComponentData(
    addressSubheading,
    locale,
    streamDocument,
  );
  const resolvedNmlsSubheadingValue = resolveComponentData(
    nmlsSubheading,
    locale,
    streamDocument,
  );
  const resolvedLanguagesSubheadingValue = resolveComponentData(
    languagesSubheading,
    locale,
    streamDocument,
  );
  const resolvedAccessibilitySubheadingValue = resolveComponentData(
    accessibilitySubheading,
    locale,
    streamDocument,
  );
  const resolvedServicesSubheadingValue = resolveComponentData(
    servicesSubheading,
    locale,
    streamDocument,
  );
  const resolvedEmailSubheadingValue = resolveComponentData(
    emails.subheading,
    locale,
    streamDocument,
  );
  const resolvedEmailsValue = resolveComponentData(
    emails.list,
    locale,
    streamDocument,
  );
  const resolvedLanguagesTextValue = resolveComponentData(
    languagesText,
    locale,
    streamDocument,
  );
  const resolvedServicesItemsValue = resolveComponentData(
    servicesItems,
    locale,
    streamDocument,
  );
  const resolvedAddress = resolveComponentData(
    address.address,
    locale,
    streamDocument,
  );
  const resolvedHours = resolveComponentData(hours, locale, streamDocument);
  const resolvedNmlsValue = resolveComponentData(
    nmlsValue,
    locale,
    streamDocument,
  );
  const normalizedSectionHeading =
    typeof resolvedSectionHeadingValue === "string"
      ? resolvedSectionHeadingValue
      : "";
  const normalizedInformationTitle =
    typeof resolvedInformationTitleValue === "string"
      ? resolvedInformationTitleValue
      : "";
  const normalizedHoursTitle =
    typeof resolvedHoursTitleValue === "string" ? resolvedHoursTitleValue : "";
  const normalizedServicesTitle =
    typeof resolvedServicesTitleValue === "string"
      ? resolvedServicesTitleValue
      : "";
  const normalizedAddressSubheading =
    typeof resolvedAddressSubheadingValue === "string"
      ? resolvedAddressSubheadingValue
      : "";
  const normalizedNmlsSubheading =
    typeof resolvedNmlsSubheadingValue === "string"
      ? resolvedNmlsSubheadingValue
      : "";
  const normalizedLanguagesSubheading =
    typeof resolvedLanguagesSubheadingValue === "string"
      ? resolvedLanguagesSubheadingValue
      : "";
  const normalizedAccessibilitySubheading =
    typeof resolvedAccessibilitySubheadingValue === "string"
      ? resolvedAccessibilitySubheadingValue
      : "";
  const normalizedServicesSubheading =
    typeof resolvedServicesSubheadingValue === "string"
      ? resolvedServicesSubheadingValue
      : "";
  const normalizedEmailSubheading =
    typeof resolvedEmailSubheadingValue === "string"
      ? resolvedEmailSubheadingValue
      : "";
  const normalizedNmlsValue =
    typeof resolvedNmlsValue === "string" ? resolvedNmlsValue : "";
  const resolvedLanguages = normalizeResolvedStringList(
    resolvedLanguagesTextValue,
  );
  const resolvedServices = normalizeResolvedStringList(
    resolvedServicesItemsValue,
  );
  const resolvedEmails = normalizeResolvedStringList(resolvedEmailsValue)
    .map((emailValue) => emailValue.trim())
    .filter((emailValue) => emailValue.length > 0);
  const resolvedPhoneItems = (phones.items ?? []).reduce<
    Array<{
      fieldId: string;
      constantValueEnabled?: boolean;
      label: string;
      originalNumber: string;
      formattedNumber: string;
      telDigits: string;
    }>
  >((items, item) => {
    const resolvedNumber = resolveComponentData(
      item.number,
      locale,
      streamDocument,
    );
    const normalizedNumber =
      typeof resolvedNumber === "string" ? resolvedNumber.trim() : "";

    if (!normalizedNumber) {
      return items;
    }

    items.push({
      fieldId: item.number.field,
      constantValueEnabled: item.number.constantValueEnabled,
      label: item.label.trim(),
      originalNumber: normalizedNumber,
      formattedNumber: formatPhoneNumber(normalizedNumber, phones.phoneFormat),
      telDigits: normalizedNumber.replace(/\D/g, ""),
    });

    return items;
  }, []);
  const sectionSurfaceStyle = getSurfaceColorStyle(
    section.backgroundColor,
    streamDocument,
  );
  const cardSurfaceStyle = getSurfaceColorStyle(
    cards.backgroundColor,
    streamDocument,
  );
  const cardTitleStyle = getTextStyles(
    cards.titleStyles.styles,
    cards.titleStyles.fontColor,
  );
  const cardSubheadingStyle = getTextStyles(
    cards.subheadingStyles.styles,
    cards.subheadingStyles.fontColor,
  );
  const cardContentStyle = getTextStyles(
    cards.contentStyles.styles,
    cards.contentStyles.fontColor,
  );
  const cardContentColor =
    getThemeColorCssValue(cards.contentStyles.fontColor) ??
    (isDarkColor(cards.backgroundColor, streamDocument) ? "#fff" : "#000");
  const hasDarkCardBackground = isDarkColor(
    cards.backgroundColor,
    streamDocument,
  );
  const accessibilityRichTextStyleOverrides = {
    ...cards.contentStyles.styles,
    color: cardContentColor,
  };
  const resolvedAccessibilityTextValue = resolveComponentData(
    accessibilityText,
    locale,
    streamDocument,
    { richTextStyleOverrides: accessibilityRichTextStyleOverrides },
  );
  const primaryCtaValue: Partial<ComprehensiveCTAValue> = {
    data: primaryCta.data,
    styles: primaryCta.styles,
  };
  const secondaryCtaValue: Partial<ComprehensiveCTAValue> = {
    data: secondaryCta.data,
    styles: secondaryCta.styles,
  };
  return (
    <VisibilityWrapper
      isEditing={puck.isEditing}
      liveVisibility={section.visibleOnLivePage}
    >
      <style>{`
h1, h1[class] { font-family: var(--fontFamily-h1-fontFamily); font-size: var(--fontSize-h1-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h1-fontWeight); font-style: var(--fontStyle-h1-fontStyle); text-transform: var(--textTransform-h1-textTransform); }
h2, h2[class] { font-family: var(--fontFamily-h2-fontFamily); font-size: var(--fontSize-h2-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h2-fontWeight); font-style: var(--fontStyle-h2-fontStyle); text-transform: var(--textTransform-h2-textTransform); }
h3, h3[class] { font-family: var(--fontFamily-h3-fontFamily); font-size: var(--fontSize-h3-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h3-fontWeight); font-style: var(--fontStyle-h3-fontStyle); text-transform: var(--textTransform-h3-textTransform); }
h4, h4[class] { font-family: var(--fontFamily-h4-fontFamily); font-size: var(--fontSize-h4-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h4-fontWeight); font-style: var(--fontStyle-h4-fontStyle); text-transform: var(--textTransform-h4-textTransform); }
h5, h5[class] { font-family: var(--fontFamily-h5-fontFamily); font-size: var(--fontSize-h5-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h5-fontWeight); font-style: var(--fontStyle-h5-fontStyle); text-transform: var(--textTransform-h5-textTransform); }
h6, h6[class] { font-family: var(--fontFamily-h6-fontFamily); font-size: var(--fontSize-h6-fontSize); line-height: 1.2; font-weight: var(--fontWeight-h6-fontWeight); font-style: var(--fontStyle-h6-fontStyle); text-transform: var(--textTransform-h6-textTransform); }
.yext-private-wealth-hours { width: 100%; min-width: 0; }
.yext-private-wealth-hours .HoursTable { width: 100%; min-width: 0; max-width: 100%; }
.yext-private-wealth-hours .HoursTable-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 0.75rem; width: 100%; min-width: 0; }
.yext-private-wealth-hours .HoursTable-day, .yext-private-wealth-hours .HoursTable-intervals, .yext-private-wealth-hours .HoursTable-interval { min-width: 0; }
.yext-private-wealth-hours .HoursTable-intervals { text-align: right; }
.yext-private-wealth-hours .HoursTable-interval { white-space: normal; overflow-wrap: anywhere; }
.yext-private-wealth-hours .is-today .HoursTable-day, .yext-private-wealth-hours .is-today .HoursTable-interval { font-weight: bolder; }
      `}</style>
      <AnalyticsScopeProvider name={scopeName}>
        <Background background={section.backgroundColor}>
          <section
            className="px-6 py-16 md:px-8 lg:px-10"
            style={sectionSurfaceStyle}
          >
            <div className="mx-auto max-w-[1600px]">
              <EntityField
                displayName="Section Heading"
                fieldId={sectionHeading.text.field}
                constantValueEnabled={sectionHeading.text.constantValueEnabled}
              >
                <h2
                  className="text-center font-serif text-4xl tracking-[-0.04em] md:text-5xl"
                  style={getTextStyles(
                    sectionHeading.styles,
                    sectionHeading.fontColor,
                  )}
                >
                  {normalizedSectionHeading}
                </h2>
              </EntityField>
              <div className="mt-10 grid gap-5 xl:grid-cols-3">
                <article
                  className="flex h-full flex-col rounded-lg border border-current/15 px-6 py-7 shadow-sm"
                  style={cardSurfaceStyle}
                >
                  <EntityField
                    displayName="Information Card Title"
                    fieldId={informationTitle.field}
                    constantValueEnabled={informationTitle.constantValueEnabled}
                  >
                    <h3
                      className="font-serif text-[1.9rem] leading-none tracking-[-0.04em]"
                      style={cardTitleStyle}
                    >
                      {normalizedInformationTitle}
                    </h3>
                  </EntityField>
                  <div className="mt-5 space-y-4 text-sm leading-7 md:text-base">
                    <div>
                      <EntityField
                        displayName="Address Subheading"
                        fieldId={addressSubheading.field}
                        constantValueEnabled={
                          addressSubheading.constantValueEnabled
                        }
                      >
                        <h4
                          className="font-semibold"
                          style={cardSubheadingStyle}
                        >
                          {normalizedAddressSubheading}
                        </h4>
                      </EntityField>
                      {resolvedAddress ? (
                        <EntityField
                          displayName="Address"
                          fieldId={address.address.field}
                          constantValueEnabled={
                            address.address.constantValueEnabled
                          }
                        >
                          <div style={cardContentStyle}>
                            <Address
                              address={resolvedAddress}
                              showCountry={address.showCountry}
                              showRegion={address.showRegion}
                            />
                          </div>
                        </EntityField>
                      ) : null}
                    </div>
                    {resolvedPhoneItems.map((item, index) => (
                      <div key={index} style={cardContentStyle}>
                        {item.label ? (
                          <h4
                            className="font-semibold"
                            style={cardSubheadingStyle}
                          >
                            {item.label}
                          </h4>
                        ) : null}
                        <EntityField
                          displayName={item.label || "Phone Number"}
                          fieldId={item.fieldId}
                          constantValueEnabled={item.constantValueEnabled}
                        >
                          {phones.includeHyperlink ? (
                            <Link
                              className="underline hover:no-underline"
                              cta={{
                                link: item.telDigits,
                                linkType: "PHONE",
                              }}
                            >
                              {item.formattedNumber}
                            </Link>
                          ) : (
                            <span>{item.formattedNumber}</span>
                          )}
                        </EntityField>
                      </div>
                    ))}
                    {resolvedEmails.length > 0 ? (
                      <div style={cardContentStyle}>
                        {normalizedEmailSubheading ? (
                          <EntityField
                            displayName="Email Subheading"
                            fieldId={emails.subheading.field}
                            constantValueEnabled={
                              emails.subheading.constantValueEnabled
                            }
                          >
                            <h4
                              className="font-semibold"
                              style={cardSubheadingStyle}
                            >
                              {normalizedEmailSubheading}
                            </h4>
                          </EntityField>
                        ) : null}
                        <EntityField
                          displayName="Emails"
                          fieldId={emails.list.field}
                          constantValueEnabled={
                            emails.list.constantValueEnabled
                          }
                        >
                          <div className="flex flex-col gap-2">
                            {resolvedEmails.map((emailValue, index) => (
                              <Link
                                key={index}
                                cta={{
                                  link: emailValue,
                                  linkType: "EMAIL",
                                }}
                              >
                                {emailValue.replace(/^mailto:/i, "")}
                              </Link>
                            ))}
                          </div>
                        </EntityField>
                      </div>
                    ) : null}
                    <div>
                      <EntityField
                        displayName="NMLS Subheading"
                        fieldId={nmlsSubheading.field}
                        constantValueEnabled={
                          nmlsSubheading.constantValueEnabled
                        }
                      >
                        <h4
                          className="font-semibold"
                          style={cardSubheadingStyle}
                        >
                          {normalizedNmlsSubheading}
                        </h4>
                      </EntityField>
                      <EntityField
                        displayName="NMLS Value"
                        fieldId={nmlsValue.field}
                        constantValueEnabled={nmlsValue.constantValueEnabled}
                      >
                        <div style={cardContentStyle}>
                          {normalizedNmlsValue}
                        </div>
                      </EntityField>
                    </div>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-3 pt-8">
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
                                hasDarkCardBackground
                                  ? "border-white/40 hover:border-white"
                                  : "border-current/15 hover:border-current"
                              }`
                            : "w-full max-w-full whitespace-normal break-words px-6 py-3 text-center transition hover:opacity-90 sm:w-auto"
                        }
                        eventName="primaryCta"
                        value={primaryCtaValue}
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
                                hasDarkCardBackground
                                  ? "border-white/40 hover:border-white"
                                  : "border-current/15 hover:border-current"
                              }`
                            : "w-full max-w-full whitespace-normal break-words px-6 py-3 text-center transition hover:opacity-90 sm:w-auto"
                        }
                        eventName="secondaryCta"
                        value={secondaryCtaValue}
                      />
                    </EntityField>
                  </div>
                </article>

                <article
                  className="rounded-lg border border-current/15 px-6 py-7 shadow-sm"
                  style={cardSurfaceStyle}
                >
                  <EntityField
                    displayName="Hours Card Title"
                    fieldId={hoursTitle.field}
                    constantValueEnabled={hoursTitle.constantValueEnabled}
                  >
                    <h3
                      className="font-serif text-[1.9rem] leading-none tracking-[-0.04em]"
                      style={cardTitleStyle}
                    >
                      {normalizedHoursTitle}
                    </h3>
                  </EntityField>
                  {resolvedHours ? (
                    <EntityField
                      displayName="Hours"
                      fieldId={hours.field}
                      constantValueEnabled={hours.constantValueEnabled}
                    >
                      <div
                        className="yext-private-wealth-hours mt-5 flex min-w-0 flex-col items-start"
                        style={cardContentStyle}
                      >
                        <HoursTable
                          hours={resolvedHours}
                          comingSoon={streamDocument.comingSoon}
                          startOfWeek={hoursStyles.startOfWeek}
                          collapseDays={hoursStyles.collapseDays}
                        />
                      </div>
                    </EntityField>
                  ) : null}
                </article>

                <article
                  className="rounded-lg border border-current/15 px-6 py-7 shadow-sm"
                  style={cardSurfaceStyle}
                >
                  <EntityField
                    displayName="Services Card Title"
                    fieldId={servicesTitle.field}
                    constantValueEnabled={servicesTitle.constantValueEnabled}
                  >
                    <h3
                      className="font-serif text-[1.9rem] leading-none tracking-[-0.04em]"
                      style={cardTitleStyle}
                    >
                      {normalizedServicesTitle}
                    </h3>
                  </EntityField>
                  <div className="mt-5 space-y-5 text-sm leading-7 md:text-base">
                    <div>
                      <EntityField
                        displayName="Languages Subheading"
                        fieldId={languagesSubheading.field}
                        constantValueEnabled={
                          languagesSubheading.constantValueEnabled
                        }
                      >
                        <h4
                          className="font-semibold"
                          style={cardSubheadingStyle}
                        >
                          {normalizedLanguagesSubheading}
                        </h4>
                      </EntityField>
                      <EntityField
                        displayName="Languages Text"
                        fieldId={languagesText.field}
                        constantValueEnabled={
                          languagesText.constantValueEnabled
                        }
                      >
                        <p style={cardContentStyle}>
                          {resolvedLanguages.join(", ")}
                        </p>
                      </EntityField>
                    </div>
                    <div className="border-t border-current/15 pt-5">
                      <EntityField
                        displayName="Accessibility Subheading"
                        fieldId={accessibilitySubheading.field}
                        constantValueEnabled={
                          accessibilitySubheading.constantValueEnabled
                        }
                      >
                        <h4
                          className="font-semibold"
                          style={cardSubheadingStyle}
                        >
                          {normalizedAccessibilitySubheading}
                        </h4>
                      </EntityField>
                      <EntityField
                        displayName="Accessibility Text"
                        fieldId={accessibilityText.field}
                        constantValueEnabled={
                          accessibilityText.constantValueEnabled
                        }
                      >
                        <div>
                          {renderResolvedRichText(
                            resolvedAccessibilityTextValue,
                            accessibilityRichTextStyleOverrides,
                          )}
                        </div>
                      </EntityField>
                    </div>
                    <div className="border-t border-current/15 pt-5">
                      <EntityField
                        displayName="Services Subheading"
                        fieldId={servicesSubheading.field}
                        constantValueEnabled={
                          servicesSubheading.constantValueEnabled
                        }
                      >
                        <h4
                          className="font-semibold"
                          style={cardSubheadingStyle}
                        >
                          {normalizedServicesSubheading}
                        </h4>
                      </EntityField>
                      <EntityField
                        displayName="Services Items"
                        fieldId={servicesItems.field}
                        constantValueEnabled={
                          servicesItems.constantValueEnabled
                        }
                      >
                        <ul
                          className="mt-2 list-disc space-y-1 pl-5"
                          style={cardContentStyle}
                        >
                          {resolvedServices.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </EntityField>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PrivateWealthLocationDetailsSection: YextComponentConfig<PrivateWealthLocationDetailsSectionProps> =
  {
    label: "Location Details Section",
    fields: toPuckFields(privateWealthLocationDetailsFields),
    defaultProps: {
      sectionHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Location Details",
          },
          constantValueEnabled: true,
        },
        styles: createDefaultStyledTextValue(),
        fontColor: undefined,
      },
      informationCard: {
        title: {
          field: "",
          constantValue: { defaultValue: "Location information" },
          constantValueEnabled: true,
        },
        addressSubheading: {
          field: "",
          constantValue: { defaultValue: "Address" },
          constantValueEnabled: true,
        },
        address: {
          address: {
            field: "address",
            constantValue: {
              line1: "",
              city: "",
              postalCode: "",
              countryCode: "",
              region: "",
            },
            constantValueEnabled: false,
          },
          showRegion: true,
          showCountry: false,
        },
        phones: {
          items: [
            {
              number: {
                field: "mainPhone",
                constantValue: "",
                constantValueEnabled: false,
              },
              label: "Main Phone",
            },
            {
              number: {
                field: "",
                constantValue: "+1 (704) 555-0112",
                constantValueEnabled: true,
              },
              label: "Customer Service",
            },
          ],
          phoneFormat: "domestic",
          includeHyperlink: true,
        },
        emails: {
          subheading: {
            field: "",
            constantValue: { defaultValue: "Email" },
            constantValueEnabled: true,
          },
          list: {
            field: "emails",
            constantValue: ["example@brand.com"],
            constantValueEnabled: false,
          },
        },
        nmlsSubheading: {
          field: "",
          constantValue: { defaultValue: "NMLS number" },
          constantValueEnabled: true,
        },
        nmlsValue: {
          field: "",
          constantValue: { defaultValue: "1987654" },
          constantValueEnabled: true,
        },
        primaryCta: createDefaultComprehensiveCTA(
          "Visit Website",
          "#",
          "primary",
        ),
        secondaryCta: createDefaultComprehensiveCTA(
          "Book Appointment",
          "#",
          "secondary",
        ),
      },
      hoursCard: {
        title: {
          field: "",
          constantValue: { defaultValue: "Lobby Hours" },
          constantValueEnabled: true,
        },
        hours: {
          field: "hours",
          constantValue: {},
          constantValueEnabled: false,
        },
        hoursStyles: {
          startOfWeek: "today",
          collapseDays: false,
        },
      },
      servicesCard: {
        title: {
          field: "",
          constantValue: { defaultValue: "Client services" },
          constantValueEnabled: true,
        },
        languagesSubheading: {
          field: "",
          constantValue: { defaultValue: "Languages" },
          constantValueEnabled: true,
        },
        languagesText: {
          field: "",
          constantValue: ["English", "Spanish", "Chinese", "French"],
          constantValueEnabled: true,
        },
        accessibilitySubheading: {
          field: "",
          constantValue: { defaultValue: "Accessibility" },
          constantValueEnabled: true,
        },
        accessibilityText: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "ADA compliant entrance, elevator access, private consultation rooms",
            ),
          },
          constantValueEnabled: true,
        },
        servicesSubheading: {
          field: "",
          constantValue: { defaultValue: "Services" },
          constantValueEnabled: true,
        },
        servicesItems: {
          field: "",
          constantValue: [
            "Private consultations",
            "Accessible entrance",
            "Notary on-site",
            "Drive-thru ATM",
          ],
          constantValueEnabled: true,
        },
      },
      cards: {
        backgroundColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
        titleStyles: {
          styles: createDefaultStyledTextValue(),
          fontColor: undefined,
        },
        subheadingStyles: {
          styles: createDefaultStyledTextValue(),
          fontColor: undefined,
        },
        contentStyles: {
          styles: createDefaultStyledTextValue(),
          fontColor: undefined,
        },
      },
      section: {
        visibleOnLivePage: true,
        backgroundColor: { selectedColor: "white", contrastingColor: "black" },
      },
    },
    render: (props) => (
      <PrivateWealthLocationDetailsSectionComponent {...props} />
    ),
  };

export const config: SectionConfig = {
  id: "PrivateWealthLocationDetailsSection",
  displayName: "Location Details Section",
  description: "Location Details Section",
  pageSetTypes: ["ENTITY"],
};
