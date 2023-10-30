function generateUniqueCode() {
    return 'xxxx-xxxx-xxxx'.replace(/[x]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return r.toString(16);
    });
}

module.exports = {
    generateUniqueCode
};
