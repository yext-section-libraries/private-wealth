import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import {
  EntityField,
  getAggregateRating,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  isDarkColor,
  resolveComponentData,
  toPuckFields,
  useDocument,
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

type StyledTextStyleProps = {
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type ReviewComment = {
  content?: string;
  commentDate?: string;
};

type Review = {
  authorName?: string;
  comments?: ReviewComment[];
  content?: string;
  rating?: number;
  reviewDate?: string;
};

type StreamDocumentWithReviews = StreamDocument & {
  ref_reviewsAgg?: {
    publisher?: string;
    topReviews?: Review[];
  }[];
};

type PrivateWealthTestimonialsSectionProps = {
  cardStyles: {
    body: StyledTextStyleProps;
    date: StyledTextStyleProps;
    reviewName: StyledTextStyleProps;
    stars: StyledTextStyleProps;
  };
  heading: StyledTextProps;
  showDates: boolean;
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

function formatRating(rating: number): string {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

/**
 * Formats review and response dates into a stable long-form date label.
 *
 * 1. Ignore missing or invalid review timestamps.
 * 2. Reuse the stream document locale when it is available.
 * 3. Keep the rendered format consistent across review cards and responses.
 */
function formatReviewDate(
  reviewDate: string | undefined,
  locale: string,
): string | undefined {
  if (!reviewDate) {
    return undefined;
  }

  const parsedDate = new Date(reviewDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

const privateWealthTestimonialsFields: YextFields<PrivateWealthTestimonialsSectionProps> =
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
    cardStyles: {
      label: "Review Card Styles",
      type: "object",
      objectFields: {
        reviewName: {
          label: "Review Name",
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
        date: {
          label: "Date",
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
        stars: {
          label: "Stars",
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
      },
    },
    showDates: {
      label: "Show Dates",
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
  };

/**
 * Renders the captured testimonials layout with live first-party review data.
 *
 * 1. Resolve the section heading from the current stream document.
 * 2. Read aggregate rating data and top reviews from `streamDocument.ref_reviewsAgg`.
 * 3. Preserve the centered review-card layout while hiding the section live when no reviews exist.
 */
const PrivateWealthTestimonialsSectionComponent: PuckComponent<
  PrivateWealthTestimonialsSectionProps
> = ({ cardStyles, heading, id, puck, section, showDates }) => {
  const streamDocument = useDocument<StreamDocumentWithReviews>();
  const locale = streamDocument.locale ?? "en";
  const scopeName = `YextPrivateWealthTestimonialsSection${getAnalyticsScopeHash(id)}`;
  const resolvedHeadingValue = resolveComponentData(
    heading.text,
    locale,
    streamDocument,
  );
  const resolvedHeading =
    typeof resolvedHeadingValue === "string" ? resolvedHeadingValue : "";
  const { averageRating, reviewCount } = getAggregateRating(streamDocument);
  const firstPartyAggregate = streamDocument.ref_reviewsAgg?.find(
    (aggregate) => aggregate.publisher === "FIRSTPARTY",
  );
  const reviews = (firstPartyAggregate?.topReviews ?? []).slice(0, 3);
  const sectionSurfaceStyle = getSurfaceColorStyle(
    section.backgroundColor,
    streamDocument,
  );
  const headingStyle = getTextStyles(
    heading.styles,
    heading.fontColor,
    section.backgroundColor,
    streamDocument,
  );
  const reviewNameStyle = getTextStyles(
    cardStyles.reviewName.styles,
    cardStyles.reviewName.fontColor,
    section.backgroundColor,
    streamDocument,
  );
  const dateStyle = getTextStyles(
    cardStyles.date.styles,
    cardStyles.date.fontColor,
    section.backgroundColor,
    streamDocument,
  );
  const starsStyle = getTextStyles(
    cardStyles.stars.styles,
    cardStyles.stars.fontColor,
    section.backgroundColor,
    streamDocument,
  );
  const bodyStyle = getTextStyles(
    cardStyles.body.styles,
    cardStyles.body.fontColor,
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
        {reviews.length ? (
          <section
            className="px-6 py-16 md:px-8 lg:px-10"
            style={sectionSurfaceStyle}
          >
            <div className="mx-auto max-w-[1320px]">
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
              <div className="mt-6 flex flex-col items-center gap-3 text-center">
                <div
                  className="flex justify-center gap-1 text-sm"
                  aria-label={`${averageRating.toFixed(1)} out of 5 stars`}
                  style={starsStyle}
                >
                  {Array.from({
                    length: Math.max(0, Math.min(5, Math.round(averageRating))),
                  }).map((_, starIndex) => (
                    <span key={starIndex}>★</span>
                  ))}
                </div>
                <p
                  className="text-sm uppercase tracking-[0.18em] opacity-70"
                  style={starsStyle}
                >
                  {formatRating(averageRating)}/5 average rating from{" "}
                  {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </p>
              </div>
              <div className="mt-10 grid gap-10 md:grid-cols-2">
                {reviews.map((review, index) => {
                  const reviewDate = formatReviewDate(
                    review.reviewDate,
                    locale,
                  );
                  const businessResponse = review.comments?.[0];
                  const businessResponseDate = formatReviewDate(
                    businessResponse?.commentDate,
                    locale,
                  );

                  return (
                    <article
                      key={index}
                      className={`text-center ${
                        reviews.length % 2 === 1 && index === reviews.length - 1
                          ? "md:col-span-2 md:mx-auto md:w-full md:max-w-[calc((100%-2.5rem)/2)]"
                          : ""
                      }`}
                    >
                      {typeof review.rating === "number" &&
                      review.rating > 0 ? (
                        <div>
                          <div
                            className="flex justify-center gap-1 text-sm"
                            style={starsStyle}
                          >
                            {Array.from({
                              length: Math.max(
                                0,
                                Math.min(5, Math.round(review.rating)),
                              ),
                            }).map((_, starIndex) => (
                              <span key={starIndex}>★</span>
                            ))}
                          </div>
                          <p
                            className="mt-2 text-xs uppercase tracking-[0.18em] opacity-70"
                            style={starsStyle}
                          >
                            {formatRating(review.rating)}/5 stars
                          </p>
                        </div>
                      ) : null}
                      {review.content ? (
                        <blockquote className="mt-5 text-sm leading-7 opacity-70 md:text-base">
                          <p style={bodyStyle}>
                            &ldquo;{review.content}&rdquo;
                          </p>
                        </blockquote>
                      ) : null}
                      <footer className="mt-5">
                        {review.authorName ? (
                          <div
                            className="font-serif text-lg"
                            style={reviewNameStyle}
                          >
                            {review.authorName}
                          </div>
                        ) : null}
                        {showDates && reviewDate ? (
                          <time
                            className="mt-2 block text-xs uppercase tracking-[0.18em] opacity-70"
                            dateTime={review.reviewDate}
                            style={dateStyle}
                          >
                            {reviewDate}
                          </time>
                        ) : null}
                      </footer>
                      {businessResponse?.content ? (
                        <div className="mt-6 border-t border-current pt-5 text-left">
                          <p className="text-xs uppercase tracking-[0.18em] opacity-70">
                            Business response
                          </p>
                          <p
                            className="mt-3 text-sm leading-7 opacity-70"
                            style={bodyStyle}
                          >
                            {businessResponse.content}
                          </p>
                          {showDates && businessResponseDate ? (
                            <time
                              className="mt-3 block text-xs uppercase tracking-[0.18em] opacity-70"
                              dateTime={businessResponse.commentDate}
                              style={dateStyle}
                            >
                              {businessResponseDate}
                            </time>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : puck.isEditing ? (
          <section
            className="px-6 py-16 md:px-8 lg:px-10"
            style={sectionSurfaceStyle}
          >
            <div className="mx-auto max-w-[1320px]">
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
              <div className="mt-10 rounded border border-dashed border-current px-6 py-8 text-center text-sm opacity-70">
                First-party reviews will appear here when the current entity has
                review data.
              </div>
            </div>
          </section>
        ) : null}
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PrivateWealthTestimonialsSection: YextComponentConfig<PrivateWealthTestimonialsSectionProps> =
  {
    label: "Testimonials Section",
    fields: toPuckFields(privateWealthTestimonialsFields),
    defaultProps: {
      cardStyles: {
        reviewName: {
          styles: createDefaultStyledTextValue(),
          fontColor: undefined,
        },
        date: {
          styles: createDefaultStyledTextValue(),
          fontColor: undefined,
        },
        stars: {
          styles: createDefaultStyledTextValue(),
          fontColor: undefined,
        },
        body: {
          styles: createDefaultStyledTextValue(),
          fontColor: undefined,
        },
      },
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Testimonials",
          },
          constantValueEnabled: true,
        },
        styles: createDefaultStyledTextValue(),
        fontColor: undefined,
      },
      showDates: true,
      section: {
        visibleOnLivePage: true,
        backgroundColor: { selectedColor: "white", contrastingColor: "black" },
      },
    },
    render: (props) => (
      <PrivateWealthTestimonialsSectionComponent {...props} />
    ),
  };

export const config: SectionConfig = {
  id: "PrivateWealthTestimonialsSection",
  displayName: "Testimonials Section",
  description: "Testimonials Section",
  pageSetTypes: ["ENTITY"],
};
