function BlasonServerViewer({ imageIndex, size = '3rem' }) {
    return (
        <img
            src={`/blasons/blason${imageIndex}.png`}
            alt=""
            className="server-list__blason-img"
            style={{ width: size, height: size }}
        />
    );
}

export default BlasonServerViewer;
