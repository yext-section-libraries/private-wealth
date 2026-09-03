import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider, Link } from "@yext/pages-components";
import {
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  resolveBreadcrumbs,
  resolveComponentData,
  toPuckFields,
  useDocument,
  useTemplateProps,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
} from "@yext/visual-editor";

type PrivateWealthBreadcrumbsProps = {
  includeCurrentLocation: boolean;
  rootLabel: YextEntityField<TranslatableString>;
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
};

const privateWealthBreadcrumbsFields: YextFields<PrivateWealthBreadcrumbsProps> =
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
    rootLabel: {
      label: "Root Label",
      type: "entityField",
      filter: {
        types: ["type.string"],
      },
    },
    includeCurrentLocation: {
      label: "Include Current Location",
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
  };

/**
 * Renders the directory path for the current location.
 *
 * 1. Resolve live breadcrumb items and the configurable root label.
 * 2. Prefix directory links for the active template path.
 * 3. Render the current location from the stream document when enabled.
 */
const PrivateWealthBreadcrumbsComponent: PuckComponent<
  PrivateWealthBreadcrumbsProps
> = ({ id, includeCurrentLocation, puck, rootLabel, section }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const breadcrumbs = resolveBreadcrumbs(streamDocument);
  const resolvedRootLabelValue = resolveComponentData(
    rootLabel,
    locale,
    streamDocument,
  );
  const resolvedRootLabel =
    typeof resolvedRootLabelValue === "string" ? resolvedRootLabelValue : "";
  const visibleBreadcrumbs =
    includeCurrentLocation || breadcrumbs.length <= 1
    ? breadcrumbs
    : breadcrumbs.slice(0, -1);

  if (!visibleBreadcrumbs.length) {
    return puck.isEditing ? (
      <p
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "18px 24px",
        }}
      >
        No breadcrumbs available (section will be hidden on live page). Create a
        directory to enable breadcrumbs.
      </p>
    ) : (
      <></>
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
      <AnalyticsScopeProvider
        name={`PrivateWealthBreadcrumbs${getAnalyticsScopeHash(id)}`}
      >
        <section
          className="border-b border-black/10 px-6 py-4 md:px-8 lg:px-10"
          style={getSurfaceColorStyle(section.backgroundColor, streamDocument)}
        >
          <nav aria-label="Breadcrumb">
            <ol className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-y-1 text-xs uppercase tracking-[0.14em] md:text-sm">
              {visibleBreadcrumbs.map((breadcrumb, index) => {
                const isCurrentLocation = index === breadcrumbs.length - 1;
                const label =
                  index === 0 && resolvedRootLabel
                    ? resolvedRootLabel
                    : isCurrentLocation
                      ? streamDocument.name || breadcrumb.name
                      : breadcrumb.name;
                const href = relativePrefixToRoot
                  ? relativePrefixToRoot + breadcrumb.slug
                  : breadcrumb.slug;

                return (
                  <li
                    key={`${breadcrumb.slug}-${index}`}
                    className="flex items-center"
                  >
                    {index > 0 ? (
                      <span aria-hidden="true" className="mx-3 opacity-45">
                        /
                      </span>
                    ) : null}
                    {isCurrentLocation ? (
                      <span aria-current="page">{label}</span>
                    ) : index === 0 ? (
                      <EntityField
                        displayName="Root Label"
                        fieldId={rootLabel.field}
                        constantValueEnabled={rootLabel.constantValueEnabled}
                      >
                        <Link
                          className="transition hover:opacity-60"
                          href={href}
                        >
                          {label}
                        </Link>
                      </EntityField>
                    ) : (
                      <Link className="transition hover:opacity-60" href={href}>
                        {label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PrivateWealthBreadcrumbs: YextComponentConfig<PrivateWealthBreadcrumbsProps> =
  {
    label: "Breadcrumbs",
    fields: toPuckFields(privateWealthBreadcrumbsFields),
    defaultProps: {
      includeCurrentLocation: true,
      rootLabel: {
        field: "",
        constantValue: {
          defaultValue: "Locations",
        },
        constantValueEnabled: true,
      },
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
      },
    },
    render: (props) => <PrivateWealthBreadcrumbsComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "PrivateWealthBreadcrumbs",
  displayName: "Breadcrumbs",
  description: "Breadcrumbs",
  pageSetTypes: ["ENTITY"],
};
