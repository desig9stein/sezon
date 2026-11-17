// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { feedStylesheet } from '@components/season/feedStylesheet';

const XSL_NAMESPACE = 'http://www.w3.org/1999/XSL/Transform';

describe('feedStylesheet (spec 059)', () => {
  const xsl = feedStylesheet();
  const doc = new DOMParser().parseFromString(xsl, 'application/xml');

  it('AC16: is a well-formed XSLT 1.0 stylesheet that outputs HTML', () => {
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    const root = doc.documentElement;
    expect(root.namespaceURI).toBe(XSL_NAMESPACE);
    expect(root.localName).toBe('stylesheet');
    expect(root.getAttribute('version')).toBe('1.0');
    const output = [...root.children].find((child) => child.localName === 'output');
    expect(output?.namespaceURI).toBe(XSL_NAMESPACE);
    expect(output?.getAttribute('method')).toBe('html');
  });

  it('AC16: explains RSS in Bulgarian and lists the items', () => {
    expect(xsl).toContain('lang="bg"');
    expect(xsl).toContain('Какво е RSS');
    expect(xsl).toContain('Feedly');
    expect(xsl).toMatch(/<xsl:for-each select="\/rss\/channel\/item">/);
    expect(xsl).toContain('<xsl:value-of select="title"/>');
  });

  it('AC16: adds no scripts', () => {
    expect(xsl).not.toMatch(/<script/i);
  });
});
