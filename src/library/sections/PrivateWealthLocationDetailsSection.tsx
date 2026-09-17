import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import {
  msg,
  Background,
  ComprehensiveCTA,
  EntityField,
  getDefaultRTF,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  isDarkColor,
  resolveComponentData,
  useDocument,
  type ComprehensiveCTAValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
} from "@yext/visual-editor";
import { formatPhoneNumber } from "@yext/visual-editor/section-library-support";
import {
  AnalyticsScopeProvider,
  Address,
  HoursTable,
  Link,
  type AddressType,
  type DayOfWeekNames,
  type HoursType,
} from "@yext/pages-components";
import {
  createDefaultComprehensiveCTA,
  createDefaultStyledTextValue,
  getTextStyles,
  headingTypographyCss,
  renderResolvedRichText,
  type SectionProps,
  type StyledTextProps,
  type StyledTextStyleProps,
} from "../shared/sectionHelpers";

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
  section: SectionProps;
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

function normalizeResolvedStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

const privateWealthLocationDetailsFields: YextFields<PrivateWealthLocationDetailsSectionProps> =
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
    sectionHeading: {
      label: msg("fields.sectionHeading", "Section Heading"),
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
    informationCard: {
      label: msg("fields.informationCard", "Information Card"),
      type: "object",
      objectFields: {
        title: {
          type: "entityField",
          label: msg("fields.title", "Title"),
          filter: {
            types: ["type.string"],
          },
        },
        addressSubheading: {
          type: "entityField",
          label: msg("fields.addressSubheading", "Address Subheading"),
          filter: {
            types: ["type.string"],
          },
        },
        address: {
          label: msg("fields.address", "Address"),
          type: "object",
          objectFields: {
            address: {
              type: "entityField",
              label: msg("fields.address", "Address"),
              filter: {
                types: ["type.address"],
              },
            },
            showRegion: {
              label: msg("fields.showRegion", "Show Region"),
              type: "radio",
              options: [
                { label: msg("fields.options.yes", "Yes"), value: true },
                { label: msg("fields.options.no", "No"), value: false },
              ],
            },
            showCountry: {
              label: msg("fields.showCountry", "Show Country"),
              type: "radio",
              options: [
                { label: msg("fields.options.yes", "Yes"), value: true },
                { label: msg("fields.options.no", "No"), value: false },
              ],
            },
          },
        },
        phones: {
          label: msg("fields.phones", "Phones"),
          type: "object",
          objectFields: {
            items: {
              label: msg("fields.items", "Items"),
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
                  label: msg("fields.number", "Number"),
                  filter: {
                    types: ["type.phone"],
                  },
                },
                label: {
                  label: msg("fields.label", "Label"),
                  type: "text",
                },
              },
            },
            phoneFormat: {
              label: msg("fields.phoneFormat", "Phone Format"),
              type: "radio",
              options: [
                {
                  label: msg("fields.options.domestic", "Domestic"),
                  value: "domestic",
                },
                {
                  label: msg("fields.options.international", "International"),
                  value: "international",
                },
              ],
            },
            includeHyperlink: {
              label: msg("fields.includeHyperlink", "Include Hyperlink"),
              type: "radio",
              options: [
                { label: msg("fields.options.yes", "Yes"), value: true },
                { label: msg("fields.options.no", "No"), value: false },
              ],
            },
          },
        },
        emails: {
          label: msg("fields.emails", "Emails"),
          type: "object",
          objectFields: {
            subheading: {
              type: "entityField",
              label: msg("fields.subheading", "Subheading"),
              filter: {
                types: ["type.string"],
              },
            },
            list: {
              type: "entityField",
              label: msg("fields.emails", "Emails"),
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
          label: msg("fields.nmlsSubheading", "NMLS Subheading"),
          filter: {
            types: ["type.string"],
          },
        },
        nmlsValue: {
          type: "entityField",
          label: msg("fields.nmlsValue", "NMLS Value"),
          filter: {
            types: ["type.string"],
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
      },
    },
    hoursCard: {
      label: msg("fields.hoursCard", "Hours Card"),
      type: "object",
      objectFields: {
        title: {
          type: "entityField",
          label: msg("fields.title", "Title"),
          filter: {
            types: ["type.string"],
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
            startOfWeek: {
              label: msg("fields.startOfWeek", "Start Of Week"),
              type: "select",
              options: [
                {
                  label: msg("fields.options.monday", "Monday"),
                  value: "monday",
                },
                {
                  label: msg("fields.options.tuesday", "Tuesday"),
                  value: "tuesday",
                },
                {
                  label: msg("fields.options.wednesday", "Wednesday"),
                  value: "wednesday",
                },
                {
                  label: msg("fields.options.thursday", "Thursday"),
                  value: "thursday",
                },
                {
                  label: msg("fields.options.friday", "Friday"),
                  value: "friday",
                },
                {
                  label: msg("fields.options.saturday", "Saturday"),
                  value: "saturday",
                },
                {
                  label: msg("fields.options.sunday", "Sunday"),
                  value: "sunday",
                },
                { label: msg("fields.options.today", "Today"), value: "today" },
              ],
            },
            collapseDays: {
              label: msg("fields.collapseDays", "Collapse Days"),
              type: "radio",
              options: [
                { label: msg("fields.options.yes", "Yes"), value: true },
                { label: msg("fields.options.no", "No"), value: false },
              ],
            },
          },
        },
      },
    },
    servicesCard: {
      label: msg("fields.servicesCard", "Services Card"),
      type: "object",
      objectFields: {
        title: {
          type: "entityField",
          label: msg("fields.title", "Title"),
          filter: {
            types: ["type.string"],
          },
        },
        languagesSubheading: {
          type: "entityField",
          label: msg("fields.languagesSubheading", "Languages Subheading"),
          filter: {
            types: ["type.string"],
          },
        },
        languagesText: {
          type: "entityField",
          label: msg("fields.languagesText", "Languages Text"),
          filter: {
            types: ["type.string"],
            includeListsOnly: true,
          },
        },
        accessibilitySubheading: {
          type: "entityField",
          label: msg(
            "fields.accessibilitySubheading",
            "Accessibility Subheading",
          ),
          filter: {
            types: ["type.string"],
          },
        },
        accessibilityText: {
          type: "entityField",
          label: msg("fields.accessibilityText", "Accessibility Text"),
          filter: {
            types: ["type.rich_text_v2"],
          },
        },
        servicesSubheading: {
          type: "entityField",
          label: msg("fields.servicesSubheading", "Services Subheading"),
          filter: {
            types: ["type.string"],
          },
        },
        servicesItems: {
          type: "entityField",
          label: msg("fields.servicesItems", "Services Items"),
          filter: {
            types: ["type.string"],
            includeListsOnly: true,
          },
        },
      },
    },
    cards: {
      label: msg("fields.cards", "Cards"),
      type: "object",
      objectFields: {
        backgroundColor: {
          label: msg("fields.backgroundColor", "Background Color"),
          type: "basicSelector",
          options: "BACKGROUND_COLOR",
        },
        titleStyles: {
          label: msg("fields.titleStyles", "Title Styles"),
          type: "object",
          objectFields: {
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
        subheadingStyles: {
          label: msg("fields.subheadingStyles", "Subheading Styles"),
          type: "object",
          objectFields: {
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
        contentStyles: {
          label: msg("fields.bodyStyles", "Body Styles"),
          type: "object",
          objectFields: {
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
  const { t, i18n } = useTranslation();
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const dayOfWeekNames = React.useMemo<DayOfWeekNames>(() => {
    const formatter = new Intl.DateTimeFormat(i18n.language, {
      timeZone: "UTC",
      weekday: "long",
    });
    const formatWeekday = (day: number) =>
      formatter.format(new Date(Date.UTC(2024, 0, day)));

    return {
      sunday: formatWeekday(7),
      monday: formatWeekday(8),
      tuesday: formatWeekday(9),
      wednesday: formatWeekday(10),
      thursday: formatWeekday(11),
      friday: formatWeekday(12),
      saturday: formatWeekday(13),
    };
  }, [i18n.language]);
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
      <style>{`${headingTypographyCss}
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
                          dayOfWeekNames={dayOfWeekNames}
                          startOfWeek={hoursStyles.startOfWeek}
                          collapseDays={hoursStyles.collapseDays}
                          intervalTranslations={{
                            isClosed: t("closed", "Closed"),
                            open24Hours: t("open24Hours", "Open 24 Hours"),
                            reopenDate: t("reopenDate", "Reopen Date"),
                            timeFormatLocale: i18n.language,
                          }}
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
    label: msg("components.locationDetailsSection", "Location Details Section"),
    fields: privateWealthLocationDetailsFields,
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
        primaryCta: createDefaultComprehensiveCTA("Visit Website", {
          variant: "primary",
        }),
        secondaryCta: createDefaultComprehensiveCTA("Book Appointment", {
          variant: "secondary",
        }),
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
