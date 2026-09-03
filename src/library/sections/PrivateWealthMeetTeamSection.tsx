import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import {
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
    image: SharedImageStyles;
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
    borderRadius: "999px",
  };
}

function createDefaultComprehensiveCTA(
  label: string,
  link: string,
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
      variant: "link",
      color: undefined,
      button: {
        ...createDefaultStyledTextValue(),
        borderRadius: "default",
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

const teamMembersSource = createItemSource<TeamMemberFields>({
  label: "Team Members",
  mappingFields: {
    name: {
      type: "entityField",
      label: "Name",
      filter: { types: ["type.string"] },
    },
    role: {
      type: "entityField",
      label: "Position",
      filter: { types: ["type.string"] },
    },
    credentials: {
      type: "entityField",
      label: "Credentials",
      filter: { types: ["type.string"] },
    },
    licenses: {
      type: "entityField",
      label: "Licenses",
      filter: { types: ["type.string"] },
    },
    specialties: {
      type: "entityField",
      label: "Specialties",
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
      cta: createDefaultComprehensiveCTA("Advisor page", "#"),
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
      cta: createDefaultComprehensiveCTA("Advisor page", "#"),
    },
  ],
});

const privateWealthMeetTeamFields: YextFields<PrivateWealthMeetTeamSectionProps> =
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
        cardBackgroundColor: {
          label: "Card Background Color",
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
    members: teamMembersSource.field,
    labels: {
      label: "Labels",
      type: "object",
      objectFields: {
        credentials: {
          type: "entityField",
          label: "Credentials Label",
          filter: { types: ["type.string"] },
        },
        licenses: {
          type: "entityField",
          label: "Licenses Label",
          filter: { types: ["type.string"] },
        },
        specialties: {
          type: "entityField",
          label: "Specialties Label",
          filter: { types: ["type.string"] },
        },
      },
    },
    cardStyles: {
      label: "Card Styles",
      type: "object",
      objectFields: {
        name: {
          label: "Name",
          type: "object",
          objectFields: {
            styles: { label: "Text Styles", type: "styledText" },
            fontColor: {
              label: "Font Color",
              type: "basicSelector",
              options: "SITE_COLOR",
            },
          },
        },
        position: {
          label: "Position",
          type: "object",
          objectFields: {
            styles: { label: "Text Styles", type: "styledText" },
            fontColor: {
              label: "Font Color",
              type: "basicSelector",
              options: "SITE_COLOR",
            },
          },
        },
        labels: {
          label: "Labels",
          type: "object",
          objectFields: {
            styles: { label: "Text Styles", type: "styledText" },
            fontColor: {
              label: "Font Color",
              type: "basicSelector",
              options: "SITE_COLOR",
            },
          },
        },
        values: {
          label: "Values",
          type: "object",
          objectFields: {
            styles: { label: "Text Styles", type: "styledText" },
            fontColor: {
              label: "Font Color",
              type: "basicSelector",
              options: "SITE_COLOR",
            },
          },
        },
        image: {
          label: "Image",
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
            styles: { label: "Image Styles", type: "styledImage" },
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
                          { richTextStyleOverrides: richTextValueStyle },
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
    label: "Meet Team Section",
    fields: toPuckFields(privateWealthMeetTeamFields),
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
          styles: createDefaultStyledImageValue(),
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
          selectedColor: "rgba(255 255 255 / 0.05)",
          contrastingColor: "palette-primary-contrast",
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
