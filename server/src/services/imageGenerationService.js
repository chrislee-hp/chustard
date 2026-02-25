import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGE_DIR = join(__dirname, '..', 'public', 'images');

export class ImageGenerationService {
  constructor(region = 'us-east-1') {
    this.client = new BedrockRuntimeClient({ region });
    this.modelId = 'amazon.nova-canvas-v1:0';
    if (!existsSync(IMAGE_DIR)) mkdirSync(IMAGE_DIR, { recursive: true });
  }

  async generateMenuImage(menuId, nameEn, descEn) {
    const prompt = `Professional food photography of ${nameEn}${descEn ? ', ' + descEn : ''}, on a clean plate, restaurant style, top-down view, warm lighting`;

    const payload = {
      taskType: 'TEXT_IMAGE',
      textToImageParams: { text: prompt },
      imageGenerationConfig: {
        seed: Math.floor(Math.random() * 858993460),
        quality: 'standard',
        width: 512,
        height: 512,
        numberOfImages: 1,
      },
    };

    const response = await this.client.send(new InvokeModelCommand({
      modelId: this.modelId,
      body: JSON.stringify(payload),
    }));

    const { images } = JSON.parse(new TextDecoder().decode(response.body));
    const imageBuffer = Buffer.from(images[0], 'base64');
    const filename = `${menuId}.png`;
    writeFileSync(join(IMAGE_DIR, filename), imageBuffer);

    return `/images/${filename}`;
  }
}
