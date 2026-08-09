import CMS from "decap-cms-app";

// Import main site styles as a string to inject into the CMS preview pane
// eslint-disable-next-line import/no-unresolved
import styles from "!to-string-loader!css-loader!postcss-loader!sass-loader!../css/main.scss";

import PostPreview from "./cms-preview-templates/post";

CMS.registerPreviewStyle(styles, {raw: true});
CMS.registerPreviewTemplate("english_posts", PostPreview);
CMS.registerPreviewTemplate("french_posts", PostPreview);
CMS.init();
