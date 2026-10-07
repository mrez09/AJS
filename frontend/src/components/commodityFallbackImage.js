import cakalang from "../assets/image/01 Cakalang.jpg";
import deho from "../assets/image/02 Deho.jpg";
import tunaFillet from "../assets/image/03 Tuna Fillet.jpg";
import doriFillet from "../assets/image/04 Dori Fillet.jpg";
import kerapu from "../assets/image/05 Kerapu.jpg";
import kakatua from "../assets/image/06 Kakatua.jpg";

const localCommodityImages = [
  { terms: ["tuna fillet"], image: tunaFillet },
  { terms: ["dori"], image: doriFillet },
  { terms: ["cakalang", "skipjack"], image: cakalang },
  { terms: ["deho"], image: deho },
  { terms: ["kerapu", "grouper"], image: kerapu },
  { terms: ["kakatua", "parrotfish"], image: kakatua },
];

export function getCommodityFallbackImage(name) {
  const normalizedName = name?.toLocaleLowerCase("id-ID") || "";
  return (
    localCommodityImages.find(({ terms }) =>
      terms.some((term) => normalizedName.includes(term)),
    )?.image || ""
  );
}
