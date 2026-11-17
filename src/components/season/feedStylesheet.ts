import { routes } from '@components/layout/routes';
import { tokensToCss } from '@design/tokens';
import { ui } from '@i18n/bg';
import { escapeXml } from '@shared/seo';

const XSL_NAMESPACE = 'http://www.w3.org/1999/XSL/Transform';
const ATOM_NAMESPACE = 'http://www.w3.org/2005/Atom';

/** Styles of the feed page: the site's design tokens and a plain reading column. */
const PAGE_CSS = `${tokensToCss()}
body{margin:0;background:var(--color-background);color:var(--color-text);font:1.0625rem/1.55 system-ui,sans-serif}
main{max-width:42rem;margin:0 auto;padding:var(--space-6) var(--space-4)}
h1,h2{line-height:1.15}
a{color:var(--color-accent)}
a:focus-visible{outline:3px solid var(--color-focus);outline-offset:2px}
.address{padding:var(--space-2) var(--space-3);border:1px solid var(--color-border);background:var(--color-surface);overflow-wrap:anywhere}
.items{padding:0;list-style:none}
.items li{padding-block:var(--space-3);border-bottom:1px solid var(--color-rule)}
.items p{margin:var(--space-1) 0 0;color:var(--color-text-muted)}`;

/**
 * Returns the XSLT 1.0 stylesheet that browsers apply to the RSS feed, so the feed opens as a
 * Bulgarian page: what RSS is, how to follow the site in a reader app, the feed address and the
 * items with links. Feed readers ignore it. Contains no scripts.
 */
export function feedStylesheet(): string {
  const labels = ui.feedPage;
  const text = escapeXml;
  const steps = labels.steps.map((step) => `<li>${text(step)}</li>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="${XSL_NAMESPACE}" xmlns:atom="${ATOM_NAMESPACE}">
<xsl:output method="html" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
<html lang="bg">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${text(labels.title)}</title>
<style>${text(PAGE_CSS)}</style>
</head>
<body>
<main>
<h1>${text(labels.heading)}</h1>
<p>${text(labels.lead)}</p>
<h2>${text(labels.whatHeading)}</h2>
<p>${text(labels.what)}</p>
<h2>${text(labels.howHeading)}</h2>
<ol>${steps}</ol>
<p>${text(labels.addressLabel)}</p>
<p class="address"><xsl:value-of select="/rss/channel/atom:link/@href"/></p>
<h2>${text(labels.itemsHeading)}</h2>
<ul class="items">
<xsl:for-each select="/rss/channel/item">
<li><a><xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute><xsl:value-of select="title"/></a><p><xsl:value-of select="description"/></p></li>
</xsl:for-each>
</ul>
<p><a href="${text(routes.home)}">${text(labels.homeLink)}</a></p>
</main>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
`;
}
