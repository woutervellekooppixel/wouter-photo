



export async function getGalleryData() {
  const { getPortfolioGalleryData } = await import('@/lib/portfolioGallery');
  return getPortfolioGalleryData();
}
