function AppBootScreen({ message = 'Chargement... Veuillez patienter' }) {
    return (
        <div className="modal_bg">
            <div className="modal">
                <div className="modal_content_title">
                    <h2>Chargement</h2>
                </div>
                <div className="modal_content">
                    <label style={{ width: '100%', textAlign: 'center' }}>{message}</label>
                </div>
            </div>
        </div>
    );
}

export default AppBootScreen;
