import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import { AnalyticsScopeProvider, Link } from "@yext/pages-components";
import {
  msg,
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  resolveBreadcrumbs,
  resolveComponentData,
  useDocument,
  useTemplateProps,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
  pt,
} from "@yext/visual-editor";
import { baseTypographyCss, type SectionProps } from "../shared/sectionHelpers";

type PrivateWealthBreadcrumbsProps = {
  includeCurrentLocation: boolean;
  rootLabel: YextEntityField<TranslatableString>;
  section: SectionProps;
};

const privateWealthBreadcrumbsFields: YextFields<PrivateWealthBreadcrumbsProps> =
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
    rootLabel: {
      label: msg("fields.rootLabel", "Root Label"),
      type: "entityField",
      filter: {
        types: ["type.string"],
      },
    },
    includeCurrentLocation: {
      label: msg("fields.includeCurrentLocation", "Include Current Location"),
      type: "radio",
      options: [
        { label: msg("fields.options.yes", "Yes"), value: true },
        { label: msg("fields.options.no", "No"), value: false },
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
  const { t } = useTranslation();
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
        {pt(
          "noBreadcrumbsAvailable",
          "No breadcrumbs available (section will be hidden on live page). Create a directory to enable breadcrumbs.",
        )}
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
      <style>{baseTypographyCss}</style>
      <AnalyticsScopeProvider
        name={`PrivateWealthBreadcrumbs${getAnalyticsScopeHash(id)}`}
      >
        <section
          className="border-b border-black/10 px-6 py-4 md:px-8 lg:px-10"
          style={getSurfaceColorStyle(section.backgroundColor, streamDocument)}
        >
          <nav aria-label={t("breadcrumb", "Breadcrumb")}>
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
    label: msg("components.breadcrumbs", "Breadcrumbs"),
    fields: privateWealthBreadcrumbsFields,
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
