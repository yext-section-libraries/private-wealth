import type { SectionConfig } from "@yext/visual-editor";

import {
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  isDarkColor,
  mapboxStaticMapStyleOptions,
  MapboxStaticMapComponent,
  mergeMeta,
  resolveComponentData,
  resolveUrlTemplate,
  toPuckFields,
  useDocument,
  useNearbyLocations,
  useTemplateProps,
  type StreamDocument,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
} from "@yext/visual-editor";
import {
  AnalyticsScopeProvider,
  Address,
  getDirections,
  Link,
} from "@yext/pages-components";
import { parsePhoneNumber } from "awesome-phonenumber";
import type { PuckComponent } from "@puckeditor/core";
import type { CSSProperties } from "react";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type StyledTextStyleProps = {
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type GetDirectionsLinkStyles = {
  variant: "primary" | "secondary" | "link";
  fontColor?: ThemeColor;
};

type PhoneDisplayProps = {
  phoneFormat: "international" | "domestic";
  includeHyperlink?: boolean;
};

type AddressDisplayProps = {
  showRegion: boolean;
  showCountry: boolean;
};

type PrivateWealthNearbyLocationsSectionProps = {
  cardStyles: {
    address: AddressDisplayProps;
    body: StyledTextStyleProps;
    getDirectionsLink: GetDirectionsLinkStyles;
    phone: PhoneDisplayProps;
    title: StyledTextStyleProps;
  };
  heading: StyledTextProps;
  limit: number;
  map: {
    coordinate: YextEntityField<Coordinate>;
    height?: string;
    mapStyle: string;
    zoom: number;
  };
  radius: number;
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
): CSSProperties {
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

const privateWealthNearbyLocationsFields: YextFields<PrivateWealthNearbyLocationsSectionProps> =
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

    radius: {
      label: "Radius (mi)",
      type: "number",
    },
    limit: {
      label: "Limit",
      type: "number",
    },
    map: {
      label: "Map",
      type: "object",
      objectFields: {
        coordinate: {
          type: "entityField",
          label: "Coordinates",
          filter: { types: ["type.coordinate"] },
        },
        mapStyle: {
          label: "Mapbox Map Style",
          type: "select",
          options: mapboxStaticMapStyleOptions,
        },
        zoom: {
          label: "Zoom",
          type: "number",
          min: 0,
          max: 22,
        },
      },
    },
    cardStyles: {
      label: "Nearby Location Styles",
      type: "object",
      objectFields: {
        title: {
          label: "Title",
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
        body: {
          label: "Body",
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
        phone: {
          label: "Phone",
          type: "object",
          objectFields: {
            phoneFormat: {
              label: "Phone Number Format",
              type: "radio",
              options: [
                { label: "Domestic", value: "domestic" },
                { label: "International", value: "international" },
              ],
            },
            includeHyperlink: {
              label: "Include Phone Hyperlink",
              type: "radio",
              options: [
                { label: "Yes", value: true },
                { label: "No", value: false },
              ],
            },
          },
        },
        address: {
          label: "Address",
          type: "object",
          objectFields: {
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
        getDirectionsLink: {
          label: "Get Directions Link",
          type: "object",
          objectFields: {
            variant: {
              label: "Variant",
              type: "radio",
              options: [
                { label: "Solid", value: "primary" },
                { label: "Outline", value: "secondary" },
                { label: "Link", value: "link" },
              ],
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
 * Renders the nearby-locations band with runtime-backed cards and a static
 * Mapbox map frame.
 *
 * 1. Resolve the heading from the current stream document.
 * 2. Read nearby locations from `useNearbyLocations`.
 * 3. Keep nearby phone and directions links runtime-driven instead of editor-managed.
 */
const PrivateWealthNearbyLocationsSectionComponent: PuckComponent<
  PrivateWealthNearbyLocationsSectionProps
> = ({ cardStyles, heading, id, limit, map, puck, radius, section }) => {
  const streamDocument = useDocument<
    StreamDocument & {
      yextDisplayCoordinate?: Coordinate;
    }
  >();
  const locale = streamDocument.locale ?? "en";
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const scopeName = `YextPrivateWealthNearbyLocationsSection${getAnalyticsScopeHash(
    id,
  )}`;
  const resolvedHeadingValue = resolveComponentData(
    heading.text,
    locale,
    streamDocument,
  );
  const resolvedHeading =
    typeof resolvedHeadingValue === "string" ? resolvedHeadingValue : "";
  const coordinate = streamDocument?.yextDisplayCoordinate;
  const enableNearbyLocations =
    coordinate?.latitude !== undefined &&
    coordinate?.longitude !== undefined &&
    radius > 0 &&
    limit > 0;
  const { data: nearbyLocationsData, status: nearbyLocationsStatus } =
    useNearbyLocations({
      streamDocument,
      latitude: coordinate?.latitude,
      longitude: coordinate?.longitude,
      radiusMi: radius,
      limit,
      enabled: enableNearbyLocations,
    });
  const sectionSurfaceStyle = getSurfaceColorStyle(
    section.backgroundColor,
    streamDocument,
  );
  const hasDarkBackground = isDarkColor(
    section.backgroundColor,
    streamDocument,
  );
  const headingStyle = getTextStyles(
    heading.styles,
    heading.fontColor,
    section.backgroundColor,
    streamDocument,
  );
  const cardTitleStyle = getTextStyles(
    cardStyles.title.styles,
    cardStyles.title.fontColor,
    section.backgroundColor,
    streamDocument,
  );
  const cardBodyStyle = getTextStyles(
    cardStyles.body.styles,
    cardStyles.body.fontColor,
    section.backgroundColor,
    streamDocument,
  );
  const linkUnderlineClassName = `border-b pb-1 no-underline transition hover:no-underline ${
    hasDarkBackground
      ? "border-white/40 hover:border-white"
      : "border-current/15 hover:border-current"
  }`;
  const getDirectionsLinkClassName =
    cardStyles.getDirectionsLink.variant === "link"
      ? `inline-flex max-w-full w-fit whitespace-normal break-words font-link-fontFamily text-link-fontSize font-link-fontWeight tracking-link-letterSpacing ${linkUnderlineClassName}`
      : cardStyles.getDirectionsLink.variant === "secondary"
        ? "inline-flex max-w-full items-center justify-center whitespace-normal break-words rounded-button-borderRadius border-2 border-current bg-transparent px-6 py-3 text-center font-button-fontFamily text-button-fontSize font-button-fontWeight tracking-button-letterSpacing"
        : "inline-flex max-w-full items-center justify-center whitespace-normal break-words rounded-button-borderRadius border-2 border-palette-primary bg-palette-primary px-6 py-3 text-center font-button-fontFamily text-button-fontSize font-button-fontWeight tracking-button-letterSpacing text-palette-primary-contrast";
  const getDirectionsLinkStyle: CSSProperties = {
    color: getThemeColorCssValue(cardStyles.getDirectionsLink.fontColor),
  };

  if (!enableNearbyLocations) {
    return <></>;
  }

  const nearbyLocationDocs = nearbyLocationsData?.response?.docs ?? [];
  const nearbyLocationCards = nearbyLocationDocs.map((locationData, index) => {
    const mergedDocument = mergeMeta(locationData, streamDocument);
    const resolvedUrl = resolveUrlTemplate(
      mergedDocument,
      relativePrefixToRoot ?? "",
    );
    const directionsUrl = getDirections(locationData.address);
    const originalPhone = locationData.mainPhone?.trim() ?? "";
    return {
      directionsUrl,
      formattedPhone: formatPhoneNumber(
        originalPhone,
        cardStyles.phone.phoneFormat,
      ),
      key: locationData.id ?? locationData.name ?? `nearby-${index}`,
      locationData,
      resolvedUrl,
      telDigits: originalPhone.replace(/\D/g, ""),
    };
  });

  const emptyState =
    nearbyLocationsStatus !== "success" || nearbyLocationCards.length === 0;
  if (nearbyLocationsStatus === "pending" || emptyState) {
    if (emptyState && !puck.isEditing) {
      return <></>;
    }

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
                  className="text-center tracking-[-0.04em]"
                  style={headingStyle}
                >
                  {resolvedHeading}
                </h2>
              </EntityField>
              <p className="mt-10 text-center text-sm opacity-60 md:text-base">
                {nearbyLocationsStatus === "pending"
                  ? "Loading nearby locations"
                  : "No nearby locations found for this location"}
              </p>
            </div>
          </section>
        </AnalyticsScopeProvider>
      </VisibilityWrapper>
    );
  }

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
        <section
          className="px-6 py-16 md:px-8 lg:px-10"
          style={sectionSurfaceStyle}
        >
          <style>{`
            .yext-private-wealth-nearby-map .mapbox-static-map-shell,
            .yext-private-wealth-nearby-map .mapbox-static-map-picture,
            .yext-private-wealth-nearby-map .mapbox-static-map-image {
              height: 100%;
              width: 100%;
            }

            .yext-private-wealth-nearby-map .mapbox-static-map-image {
              object-fit: cover;
              object-position: center;
            }
          `}</style>
          <div className="mx-auto max-w-[1600px]">
            <EntityField
              displayName="Heading"
              fieldId={heading.text.field}
              constantValueEnabled={heading.text.constantValueEnabled}
            >
              <h2
                className="text-center tracking-[-0.04em]"
                style={headingStyle}
              >
                {resolvedHeading}
              </h2>
            </EntityField>
            <div className="yext-private-wealth-nearby-map relative mt-10 overflow-hidden rounded-lg border border-current/15 bg-white">
              <EntityField
                displayName="Map Coordinate"
                fieldId={map.coordinate.field}
                constantValueEnabled={map.coordinate.constantValueEnabled}
              >
                <div className="aspect-square sm:aspect-[16/7] sm:min-h-[260px]">
                  <MapboxStaticMapComponent
                    {...map}
                    id={`${id}-map`}
                    puck={puck}
                  />
                </div>
              </EntityField>
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {nearbyLocationCards.map(
                (
                  {
                    directionsUrl,
                    formattedPhone,
                    key,
                    locationData,
                    resolvedUrl,
                    telDigits,
                  },
                  index,
                ) => (
                  <article key={key} className="space-y-3">
                    <h3
                      className="leading-none tracking-[-0.04em]"
                      style={cardTitleStyle}
                    >
                      {resolvedUrl ? (
                        <Link
                          className={`inline-flex max-w-full w-fit whitespace-normal break-words ${linkUnderlineClassName}`}
                          href={resolvedUrl}
                        >
                          {locationData.name}
                        </Link>
                      ) : (
                        <>{locationData.name}</>
                      )}
                    </h3>
                    {locationData.address ? (
                      <div style={cardBodyStyle}>
                        <Address
                          address={locationData.address}
                          showCountry={cardStyles.address.showCountry}
                          showRegion={cardStyles.address.showRegion}
                        />
                      </div>
                    ) : null}
                    {formattedPhone ? (
                      <p style={cardBodyStyle}>
                        {cardStyles.phone.includeHyperlink && telDigits ? (
                          <Link
                            className="underline hover:no-underline"
                            cta={{
                              link: telDigits,
                              linkType: "PHONE",
                            }}
                          >
                            {formattedPhone}
                          </Link>
                        ) : (
                          <span>{formattedPhone}</span>
                        )}
                      </p>
                    ) : null}
                    {directionsUrl ? (
                      <div>
                        <Link
                          className={getDirectionsLinkClassName}
                          eventName={`card${index}`}
                          href={directionsUrl}
                          style={getDirectionsLinkStyle}
                        >
                          Get directions
                        </Link>
                      </div>
                    ) : null}
                  </article>
                ),
              )}
            </div>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PrivateWealthNearbyLocationsSection: YextComponentConfig<PrivateWealthNearbyLocationsSectionProps> =
  {
    label: "Nearby Locations Section",
    fields: toPuckFields(privateWealthNearbyLocationsFields),
    defaultProps: {
      cardStyles: {
        title: {
          styles: createDefaultStyledTextValue(),
          fontColor: undefined,
        },
        body: {
          styles: createDefaultStyledTextValue(),
          fontColor: undefined,
        },
        phone: {
          phoneFormat: "domestic",
          includeHyperlink: true,
        },
        address: {
          showRegion: true,
          showCountry: false,
        },
        getDirectionsLink: {
          variant: "link",
          fontColor: undefined,
        },
      },
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Nearby [[name]] Locations",
          },
          constantValueEnabled: true,
        },
        styles: createDefaultStyledTextValue(),
        fontColor: undefined,
      },
      radius: 10,
      limit: 3,
      map: {
        coordinate: {
          field: "yextDisplayCoordinate",
          constantValue: {
            latitude: 0,
            longitude: 0,
          },
          constantValueEnabled: false,
        },
        mapStyle: "streets-v12",
        zoom: 10,
        height: "100%",
      },
      section: {
        visibleOnLivePage: true,
        backgroundColor: { selectedColor: "white", contrastingColor: "black" },
      },
    },
    render: (props) => (
      <PrivateWealthNearbyLocationsSectionComponent {...props} />
    ),
  };

export const config: SectionConfig = {
  id: "PrivateWealthNearbyLocationsSection",
  displayName: "Nearby Locations Section",
  description: "Nearby Locations Section",
  pageSetTypes: ["ENTITY"],
};
