import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaChevronRight, FaUserGroup } from 'react-icons/fa6';
import BlasonServerViewer from '../host/BlasonServerViewer.jsx';
import { countOnlinePlayers, sortServersByRecency } from '../../utils/serverList.js';

function ServerList({
    servers,
    emptyMessage,
    selectable = false,
    selectedCodes = [],
    onToggleSelect,
}) {
    const sortedServers = useMemo(() => sortServersByRecency(servers), [servers]);
    const selectedSet = useMemo(() => new Set(selectedCodes), [selectedCodes]);

    if (sortedServers.length === 0) {
        return <p className="server-list__empty">{emptyMessage}</p>;
    }

    return (
        <ul className={`server-list${selectable ? ' server-list--selectable' : ''}`}>
            {sortedServers.map((server) => {
                const onlinePlayersCount = countOnlinePlayers(server);
                const isSelected = selectedSet.has(server.code);

                return (
                    <li
                        key={server._id}
                        className={`server-list__item${isSelected ? ' server-list__item--selected' : ''}`}
                    >
                        {selectable && (
                            <button
                                type="button"
                                className={`server-list__check${isSelected ? ' is-checked' : ''}`}
                                aria-pressed={isSelected}
                                aria-label={isSelected ? `Désélectionner ${server.name}` : `Sélectionner ${server.name}`}
                                onClick={() => onToggleSelect?.(server.code)}
                            >
                                {isSelected ? <FaCheck aria-hidden="true" /> : null}
                            </button>
                        )}
                        <Link to={`/server/${server.code}`} className="server-list__link">
                            <BlasonServerViewer imageIndex={server.blason?.blason} size="3.25rem" />
                            <div className="server-list__info">
                                <span className="server-list__name">{server.name}</span>
                                <span className="server-list__meta">
                                    <FaUserGroup aria-hidden="true" />
                                    {onlinePlayersCount} en ligne
                                </span>
                            </div>
                            <FaChevronRight className="server-list__chevron" aria-hidden="true" />
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

export default ServerList;
