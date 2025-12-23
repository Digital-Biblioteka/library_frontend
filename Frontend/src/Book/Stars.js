import { Rating } from "react-simple-star-rating";

export default function StarRating({
                                       value = 0,
                                       readOnly = false,
                                       onChange
                                   }) {
    return (
        <Rating
            initialValue={value}
            readonly={readOnly}
            allowFraction
            onClick={(rate) => {
                if (!readOnly) {
                    onChange?.(rate);
                }
            }}
            size={22}
        />
    );
}
