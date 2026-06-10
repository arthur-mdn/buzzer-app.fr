import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaUserGroup } from 'react-icons/fa6';
import BlasonServerViewer from '../host/BlasonServerViewer.jsx';
import { countOnlinePlayers, sortServersByRecency } from '../../utils/serverList.js';

function ServerList({ servers, emptyMessage }) {
    const sortedServers = useMemo(() => sortServersByRecency(servers), [servers]);

    if (sortedServers.length === 0) {
        return <p className="server-list__empty">{emptyMessage}</p>;
    }

    return (
        <ul className="server-list">
            {sortedServers.map((server) => {
                const onlinePlayersCount = countOnlinePlayers(server);

                return (
                    <li key={server._id} className="server-list__item">
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
