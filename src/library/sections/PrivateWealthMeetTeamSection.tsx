import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import {
  msg,
  Background,
  ComprehensiveCTA,
  createItemSource,
  EntityField,
  getDefaultRTF,
  getAnalyticsScopeHash,
  getThemeColorCssValue,
  getSurfaceColorStyle,
  isDarkColor,
  Image,
  resolveComponentData,
  useDocument,
  type ComprehensiveCTAValue,
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
import {
  aspectRatioOptions,
  baseTypographyCss,
  createDefaultComprehensiveCTA,
  createDefaultStyledImageValue,
  createDefaultStyledTextValue,
  getTextStyles,
  renderResolvedRichText,
  type ImageStyleProps,
  type StyledTextProps,
  type StyledTextStyleProps,
} from "../shared/sectionHelpers";

type TeamMemberFields = {
  cta: ComprehensiveCTAValue;
  credentials: YextEntityField<TranslatableString>;
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  licenses: YextEntityField<TranslatableString>;
  name: YextEntityField<TranslatableString>;
  role: YextEntityField<TranslatableString>;
  specialties: YextEntityField<TranslatableRichText>;
};

type PrivateWealthMeetTeamSectionProps = {
  cardStyles: {
    image: ImageStyleProps;
    labels: StyledTextStyleProps;
    name: StyledTextStyleProps;
    position: StyledTextStyleProps;
    values: StyledTextStyleProps;
  };
  heading: StyledTextProps;
  labels: {
    credentials: YextEntityField<TranslatableString>;
    licenses: YextEntityField<TranslatableString>;
    specialties: YextEntityField<TranslatableString>;
  };
  members: typeof teamMembersSource.value;
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
    cardBackgroundColor: ThemeColor;
  };
};

const teamMembersSource = createItemSource<TeamMemberFields>({
  label: msg("fields.teamMembers", "Team Members"),
  mappingFields: {
    name: {
      type: "entityField",
      label: msg("fields.name", "Name"),
      filter: { types: ["type.string"] },
    },
    role: {
      type: "entityField",
      label: msg("fields.position", "Position"),
      filter: { types: ["type.string"] },
    },
    credentials: {
      type: "entityField",
      label: msg("fields.credentials", "Credentials"),
      filter: { types: ["type.string"] },
    },
    licenses: {
      type: "entityField",
      label: msg("fields.licenses", "Licenses"),
      filter: { types: ["type.string"] },
    },
    specialties: {
      type: "entityField",
      label: msg("fields.specialties", "Specialties"),
      filter: { types: ["type.rich_text_v2"] },
    },
    image: {
      type: "entityField",
      label: msg("fields.image", "Image"),
      filter: { types: ["type.image"] },
    },
    cta: {
      label: msg("fields.cta", "CTA"),
      type: "comprehensiveCTA",
    },
  },
  defaultValues: [
    {
      name: {
        field: "",
        constantValue: { defaultValue: "Morgan Lee" },
        constantValueEnabled: true,
      },
      role: {
        field: "",
        constantValue: { defaultValue: "Senior Wealth Advisor" },
        constantValueEnabled: true,
      },
      credentials: {
        field: "",
        constantValue: { defaultValue: "CFP" },
        constantValueEnabled: true,
      },
      licenses: {
        field: "",
        constantValue: { defaultValue: "Series 7, Series 66" },
        constantValueEnabled: true,
      },
      specialties: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Supports retirement planning and portfolio review conversations.",
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
      cta: createDefaultComprehensiveCTA("Advisor page", {
        variant: "link",
        buttonBorderRadius: "default",
      }),
    },
    {
      name: {
        field: "",
        constantValue: { defaultValue: "Avery Chen" },
        constantValueEnabled: true,
      },
      role: {
        field: "",
        constantValue: { defaultValue: "Financial Planner" },
        constantValueEnabled: true,
      },
      credentials: {
        field: "",
        constantValue: { defaultValue: "ChFC" },
        constantValueEnabled: true,
      },
      licenses: {
        field: "",
        constantValue: { defaultValue: "Series 65" },
        constantValueEnabled: true,
      },
      specialties: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Supports financial planning and goal-based discussions.",
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
      cta: createDefaultComprehensiveCTA("Advisor page", {
        variant: "link",
        buttonBorderRadius: "default",
      }),
    },
  ],
});

const privateWealthMeetTeamFields: YextFields<PrivateWealthMeetTeamSectionProps> =
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
        cardBackgroundColor: {
          label: msg("fields.cardBackgroundColor", "Card Background Color"),
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
    members: teamMembersSource.field,
    labels: {
      label: msg("fields.labels", "Labels"),
      type: "object",
      objectFields: {
        credentials: {
          type: "entityField",
          label: msg("fields.credentialsLabel", "Credentials Label"),
          filter: { types: ["type.string"] },
        },
        licenses: {
          type: "entityField",
          label: msg("fields.licensesLabel", "Licenses Label"),
          filter: { types: ["type.string"] },
        },
        specialties: {
          type: "entityField",
          label: msg("fields.specialtiesLabel", "Specialties Label"),
          filter: { types: ["type.string"] },
        },
      },
    },
    cardStyles: {
      label: msg("fields.cardStyles", "Card Styles"),
      type: "object",
      objectFields: {
        name: {
          label: msg("fields.name", "Name"),
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
        position: {
          label: msg("fields.position", "Position"),
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
        labels: {
          label: msg("fields.labels", "Labels"),
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
        values: {
          label: msg("fields.values", "Values"),
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
        image: {
          label: msg("fields.image", "Image"),
          type: "object",
          objectFields: {
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
                {
                  label: msg("fields.options.filled", "Filled"),
                  value: "filled",
                },
              ],
            },
            styles: {
              label: msg("fields.imageStyles", "Image Styles"),
              type: "styledImage",
            },
          },
        },
      },
    },
  };

/**
 * Renders the team band with field-backed heading, member cards, image, and CTA.
 *
 * 1. Resolve editor-backed content from the current stream document.
 * 2. Apply the required section background-color contract to the shell.
 * 3. Render the advisor-page action through `ComprehensiveCTA`.
 */
const PrivateWealthMeetTeamSectionComponent: PuckComponent<
  PrivateWealthMeetTeamSectionProps
> = ({ cardStyles, heading, id, labels, members, puck, section }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const scopeName = `YextPrivateWealthMeetTeamSection${getAnalyticsScopeHash(id)}`;
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
  const resolvedMembers = teamMembersSource.resolveItems(
    members as unknown as typeof teamMembersSource.value,
    streamDocument,
  );
  const cardSurfaceStyle = getSurfaceColorStyle(
    section.cardBackgroundColor,
    streamDocument,
  );
  const hasDarkBackground = isDarkColor(
    section.backgroundColor,
    streamDocument,
  );
  const resolveLabel = (label: YextEntityField<TranslatableString>) => {
    const value = resolveComponentData(label, locale, streamDocument);
    return typeof value === "string" ? value : "";
  };
  const resolvedLabels = {
    credentials: resolveLabel(labels.credentials),
    licenses: resolveLabel(labels.licenses),
    specialties: resolveLabel(labels.specialties),
  };
  const nameStyle = getTextStyles(
    cardStyles.name.styles,
    cardStyles.name.fontColor,
  );
  const positionStyle = getTextStyles(
    cardStyles.position.styles,
    cardStyles.position.fontColor,
  );
  const labelStyle = getTextStyles(
    cardStyles.labels.styles,
    cardStyles.labels.fontColor,
  );
  const valueStyle = getTextStyles(
    cardStyles.values.styles,
    cardStyles.values.fontColor,
  );
  const richTextValueStyle = {
    ...cardStyles.values.styles,
    color:
      getThemeColorCssValue(cardStyles.values.fontColor) ??
      (hasDarkBackground ? "#fff" : "#000"),
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
                displayName="Team Members"
                fieldId={members.field}
                constantValueEnabled={members.constantValueEnabled}
              >
                <div className="mt-10 grid gap-6 xl:grid-cols-2">
                  {resolvedMembers.map((member, index) => {
                    const resolvedNameValue = member.name
                      ? resolveComponentData(
                          member.name,
                          locale,
                          streamDocument,
                        )
                      : "";
                    const resolvedRoleValue = member.role
                      ? resolveComponentData(
                          member.role,
                          locale,
                          streamDocument,
                        )
                      : "";
                    const resolvedCredentialsValue = member.credentials
                      ? resolveComponentData(
                          member.credentials,
                          locale,
                          streamDocument,
                        )
                      : "";
                    const resolvedLicensesValue = member.licenses
                      ? resolveComponentData(
                          member.licenses,
                          locale,
                          streamDocument,
                        )
                      : "";
                    const resolvedSpecialtiesValue = member.specialties
                      ? resolveComponentData(
                          member.specialties,
                          locale,
                          streamDocument,
                        )
                      : undefined;
                    const resolvedImage = member.image
                      ? resolveComponentData(
                          member.image,
                          locale,
                          streamDocument,
                        )
                      : undefined;
                    const resolvedName =
                      typeof resolvedNameValue === "string"
                        ? resolvedNameValue
                        : "";
                    const resolvedRole =
                      typeof resolvedRoleValue === "string"
                        ? resolvedRoleValue
                        : "";
                    const resolvedCredentials =
                      typeof resolvedCredentialsValue === "string"
                        ? resolvedCredentialsValue
                        : "";
                    const resolvedLicenses =
                      typeof resolvedLicensesValue === "string"
                        ? resolvedLicensesValue
                        : "";
                    return (
                      <Background
                        key={index}
                        background={section.cardBackgroundColor}
                      >
                        <article
                          className="flex flex-col gap-6 rounded-lg border border-current/10 p-6 md:flex-row md:items-center"
                          style={cardSurfaceStyle}
                        >
                          <div className="mx-auto w-[140px] shrink-0 overflow-hidden md:mx-0">
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
                          <div className="flex-1 text-center md:text-left">
                            <h3
                              className="font-serif text-[1.9rem] leading-none tracking-[-0.04em]"
                              style={nameStyle}
                            >
                              {resolvedName}
                            </h3>
                            <p
                              className="mt-3 text-sm font-semibold md:text-base"
                              style={positionStyle}
                            >
                              {resolvedRole}
                            </p>
                            <div className="mt-4 space-y-2 text-sm leading-7 opacity-70">
                              <p>
                                <EntityField
                                  displayName="Credentials Label"
                                  fieldId={labels.credentials.field}
                                  constantValueEnabled={
                                    labels.credentials.constantValueEnabled
                                  }
                                >
                                  <strong
                                    className="font-semibold"
                                    style={labelStyle}
                                  >
                                    {resolvedLabels.credentials}:
                                  </strong>
                                </EntityField>{" "}
                                <span style={valueStyle}>
                                  {resolvedCredentials}
                                </span>
                              </p>
                              <p>
                                <EntityField
                                  displayName="Licenses Label"
                                  fieldId={labels.licenses.field}
                                  constantValueEnabled={
                                    labels.licenses.constantValueEnabled
                                  }
                                >
                                  <strong
                                    className="font-semibold"
                                    style={labelStyle}
                                  >
                                    {resolvedLabels.licenses}:
                                  </strong>
                                </EntityField>{" "}
                                <span style={valueStyle}>
                                  {resolvedLicenses}
                                </span>
                              </p>
                              <div>
                                <EntityField
                                  displayName="Specialties Label"
                                  fieldId={labels.specialties.field}
                                  constantValueEnabled={
                                    labels.specialties.constantValueEnabled
                                  }
                                >
                                  <strong
                                    className="font-semibold"
                                    style={labelStyle}
                                  >
                                    {resolvedLabels.specialties}:
                                  </strong>
                                </EntityField>{" "}
                                {renderResolvedRichText(
                                  resolvedSpecialtiesValue,
                                  richTextValueStyle,
                                )}
                              </div>
                            </div>
                            {member.cta ? (
                              <ComprehensiveCTA
                                className={
                                  member.cta.styles.variant === "link"
                                    ? `mt-5 max-w-full w-fit whitespace-normal break-words border-b pb-1 no-underline transition hover:no-underline ${
                                        hasDarkBackground
                                          ? "border-white/40 hover:border-white"
                                          : "border-current/15 hover:border-current"
                                      }`
                                    : "mt-5 max-w-full w-fit whitespace-normal break-words px-6 py-3 text-center transition hover:opacity-90"
                                }
                                eventName={`card${index}`}
                                value={
                                  member.cta as unknown as Partial<ComprehensiveCTAValue>
                                }
                              />
                            ) : null}
                          </div>
                        </article>
                      </Background>
                    );
                  })}
                </div>
              </EntityField>
            </div>
          </section>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PrivateWealthMeetTeamSection: YextComponentConfig<PrivateWealthMeetTeamSectionProps> =
  {
    label: msg("components.meetTeamSection", "Meet Team Section"),
    fields: privateWealthMeetTeamFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Meet the Team",
          },
          constantValueEnabled: true,
        },
        styles: createDefaultStyledTextValue(),
        fontColor: undefined,
      },
      labels: {
        credentials: {
          field: "",
          constantValue: { defaultValue: "Credentials" },
          constantValueEnabled: true,
        },
        licenses: {
          field: "",
          constantValue: { defaultValue: "Licenses" },
          constantValueEnabled: true,
        },
        specialties: {
          field: "",
          constantValue: { defaultValue: "Specialties" },
          constantValueEnabled: true,
        },
      },
      cardStyles: {
        name: {
          styles: createDefaultStyledTextValue(),
          fontColor: undefined,
        },
        position: {
          styles: createDefaultStyledTextValue(),
          fontColor: undefined,
        },
        labels: {
          styles: createDefaultStyledTextValue(),
          fontColor: undefined,
        },
        values: {
          styles: createDefaultStyledTextValue(),
          fontColor: undefined,
        },
        image: {
          aspectRatio: 1,
          imageConstrain: "filled",
          styles: createDefaultStyledImageValue("999px"),
        },
      },
      members: teamMembersSource.defaultValue,
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
        cardBackgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
      },
    },
    render: (props) => <PrivateWealthMeetTeamSectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "PrivateWealthMeetTeamSection",
  displayName: "Meet Team Section",
  description: "Meet Team Section",
  pageSetTypes: ["ENTITY"],
};
