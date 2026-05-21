const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUrls() {
  const settings = await prisma.siteSettings.findMany();
  const publicUrlSetting = settings.find(s => s.key === 'R2_PUBLIC_URL');
  const publicUrl = publicUrlSetting ? publicUrlSetting.value : '';
  
  if (!publicUrl) {
    console.log('No R2_PUBLIC_URL found in database! Please set it in Admin Settings.');
    return;
  }

  const videos = await prisma.video.findMany();
  for (const v of videos) {
    if (v.videoKey && v.thumbnailKey) {
      const newVideoUrl = `${publicUrl}/${v.videoKey}`;
      const newThumbnailUrl = `${publicUrl}/${v.thumbnailKey}`;
      await prisma.video.update({
        where: { id: v.id },
        data: { videoUrl: newVideoUrl, thumbnailUrl: newThumbnailUrl }
      });
      console.log(`Updated video: ${v.title} -> ${newVideoUrl}`);
    }
  }
  console.log('All videos updated successfully!');
}

fixUrls().finally(() => prisma.$disconnect());
