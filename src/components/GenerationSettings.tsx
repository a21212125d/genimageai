import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface GenerationSettingsProps {
  aspectRatio: string;
  onAspectRatioChange: (value: string) => void;
  style: string;
  onStyleChange: (value: string) => void;
  numImages: number;
  onNumImagesChange: (value: number) => void;
}

export const GenerationSettings = ({
  aspectRatio,
  onAspectRatioChange,
  style,
  onStyleChange,
  numImages,
  onNumImagesChange,
}: GenerationSettingsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label className="text-white mb-2 block">Aspect Ratio</Label>
        <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-card border-white/10">
            <SelectItem value="1:1">Square (1:1)</SelectItem>
            <SelectItem value="16:9">Landscape (16:9)</SelectItem>
            <SelectItem value="9:16">Portrait (9:16)</SelectItem>
            <SelectItem value="4:3">Classic (4:3)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-white mb-2 block">Style</Label>
        <Select value={style} onValueChange={onStyleChange}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-card border-white/10">
            <SelectItem value="photorealistic">Photorealistic</SelectItem>
            <SelectItem value="digital-art">Digital Art</SelectItem>
            <SelectItem value="anime">Anime</SelectItem>
            <SelectItem value="oil-painting">Oil Painting</SelectItem>
            <SelectItem value="watercolor">Watercolor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-white mb-2 block">Number of Images: {numImages}</Label>
        <Slider
          value={[numImages]}
          onValueChange={(value) => onNumImagesChange(value[0])}
          min={1}
          max={4}
          step={1}
          className="mt-2"
        />
      </div>
    </div>
  );
};