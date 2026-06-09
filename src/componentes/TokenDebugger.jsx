import { useState, useEffect } from 'react';

function TokenDebugger() {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = () => {
    const token = localStorage.getItem('token');
    
    if (!token || token === 'tu_token_aqui') {
      setTokenInfo({
        hasToken: false,
        message: 'No hay token válido configurado',
        isDefault: token === 'tu_token_aqui'
      });
      return;
    }

    try {
      // Intentar decodificar si es JWT
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        setTokenInfo({
          hasToken: true,
          isJWT: true,
          userId: payload.id || payload.userId,
          email: payload.email,
          exp: payload.exp,
          expired: payload.exp ? payload.exp * 1000 < Date.now() : false
        });
      } else {
        setTokenInfo({
          hasToken: true,
          isJWT: false,
          tokenLength: token.length
        });
      }
    } catch (err) {
      setTokenInfo({
        hasToken: true,
        error: 'No se pudo decodificar el token'
      });
    }
  };

  const handleSetTestToken = () => {
    const testToken = prompt('Pega tu token de autenticación:');
    if (testToken && testToken.trim()) {
      localStorage.setItem('token', testToken.trim());
      checkToken();
      alert('Token guardado. Recarga la página para usar el nuevo token.');
    }
  };

  const handleClearToken = () => {
    if (confirm('¿Seguro que quieres eliminar el token?')) {
      localStorage.removeItem('token');
      checkToken();
      alert('Token eliminado. Recarga la página.');
    }
  };

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 15px',
          backgroundColor: tokenInfo?.hasToken && !tokenInfo?.expired ? '#27ae60' : '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 999,
          width: '50px',
          height: '50px'
        }}
        title="Ver estado de autenticación"
      >
        🔐
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'white',
      border: '2px solid #ddd',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      maxWidth: '350px',
      zIndex: 999
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Estado de Autenticación</h3>
        <button
          onClick={() => setVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>
      </div>

      {tokenInfo && (
        <div style={{ fontSize: '14px', color: '#666' }}>
          {tokenInfo.hasToken ? (
            <>
              <div style={{
                padding: '10px',
                backgroundColor: tokenInfo.expired ? '#fee' : '#e8f5e9',
                borderRadius: '5px',
                marginBottom: '15px',
                border: `1px solid ${tokenInfo.expired ? '#fcc' : '#c8e6c9'}`
              }}>
                <p style={{ margin: '5px 0', fontWeight: 'bold', color: tokenInfo.expired ? '#c33' : '#27ae60' }}>
                  {tokenInfo.expired ? '❌ Token Expirado' : '✅ Token Válido'}
                </p>
                
                {tokenInfo.isJWT && (
                  <>
                    {tokenInfo.userId && (
                      <p style={{ margin: '5px 0' }}>
                        <strong>User ID:</strong> {tokenInfo.userId}
                      </p>
                    )}
                    {tokenInfo.email && (
                      <p style={{ margin: '5px 0' }}>
                        <strong>Email:</strong> {tokenInfo.email}
                      </p>
                    )}
                    {tokenInfo.exp && (
                      <p style={{ margin: '5px 0' }}>
                        <strong>Expira:</strong> {new Date(tokenInfo.exp * 1000).toLocaleString('es-ES')}
                      </p>
                    )}
                  </>
                )}
                
                {!tokenInfo.isJWT && (
                  <p style={{ margin: '5px 0' }}>
                    Token de {tokenInfo.tokenLength} caracteres (no es JWT)
                  </p>
                )}
              </div>
            </>
          ) : (
            <div style={{
              padding: '10px',
              backgroundColor: '#fee',
              borderRadius: '5px',
              marginBottom: '15px',
              border: '1px solid #fcc'
            }}>
              <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#c33' }}>
                ❌ {tokenInfo.message}
              </p>
              {tokenInfo.isDefault && (
                <p style={{ margin: '5px 0', fontSize: '12px' }}>
                  El token por defecto no es válido. Configura uno real.
                </p>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button
              onClick={handleSetTestToken}
              style={{
                padding: '8px 15px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              📝 Configurar Token
            </button>
            
            {tokenInfo.hasToken && (
              <button
                onClick={handleClearToken}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                🗑️ Eliminar Token
              </button>
            )}
            
            <button
              onClick={checkToken}
              style={{
                padding: '8px 15px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              🔄 Actualizar
            </button>
          </div>

          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '5px',
            fontSize: '12px'
          }}>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
              ℹ️ ¿Necesitas ayuda?
            </p>
            <p style={{ margin: '5px 0' }}>
              Lee la guía completa en <code>SOLUCION_ERROR_404_TOKEN.md</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TokenDebugger;
