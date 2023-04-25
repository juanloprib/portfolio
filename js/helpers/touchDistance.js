const touchDistance = (touch1, touch2) => {
    return Math.sqrt(
        Math.pow(touch1.clientX - touch2.clientX, 2) +
        Math.pow(touch1.clientY - touch2.clientY, 2)
    );
};

export default touchDistance;