import Image, { ImageProps } from "next/image";

interface ImageCardProps extends Omit<ImageProps, "src"> {
  src: ImageProps["src"];
}

const ImageCard = ({ src, alt = "", ...rest }: ImageCardProps) => {
  let finalSrc = "/placeholder.svg";

  if (typeof src === "string") {
    if (src === "") {
      finalSrc = "/placeholder.svg";
    } else if (
      src.startsWith("/logos") ||
      src.startsWith("/images") ||
      src.startsWith("/test")
    ) {
      finalSrc = src;
    } else if (src.startsWith("/uploads/")) {
      const x=`${process.env.NEXT_PUBLIC_API_URL}`
      finalSrc ="/placeholder.svg";
    } else if (
      src.startsWith("blob:") || // Local file from input
      src.startsWith("data:") || // Base64 image
      src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.includes("google")
    ) {
      finalSrc = src;
    } else {
      finalSrc = "/placeholder.svg";
    }
  }

  return (
    <Image
      {...rest}
      alt={alt}
      src={finalSrc}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = "/placeholder.svg";
      }}
    />
  );
};

export default ImageCard;