import { useState } from "react";

const MetamaskHelp = () => {
    const [showHelp, setShowHelp] = useState(false);

    return (
        <div className="mt-6 text-sm text-gray-700">
            <p className="text-center">
                여러 지갑 계정을 연결하고 싶으신가요?{" "}
                <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="text-blue-500 underline hover:text-blue-700"
                >
                    메타마스크 계정 연결 방법 보기
                </button>
            </p>

            {showHelp && (
                <div className="mt-4 bg-gray-50 p-4 border rounded-lg shadow-sm">
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>
                            브라우저 툴바에서 <strong>🦊 메타마스크 아이콘</strong>을 클릭합니다.
                        </li>
                        <li>
                            오른쪽 상단의 <strong>계정 아이콘 또는 점 세 개(⋮)</strong>를 클릭합니다.
                        </li>
                        <li>
                            <strong>“연결된 사이트 보기”</strong> 또는 <strong>“Connected sites”</strong>를 선택합니다.
                        </li>
                        <li>
                            현재 사이트 주소(<code>localhost</code> 또는 도메인)를 선택합니다.
                        </li>
                        <li>
                            <strong>추가로 연결할 계정</strong>을 체크한 뒤 “다음” → “연결”을 클릭합니다.
                        </li>
                        <li>
                            연결이 완료되면 페이지를 새로고침하거나 다시 "지갑 연결" 버튼을 클릭하세요.
                        </li>
                    </ol>
                    <p className="mt-4 text-gray-500 italic">
                        ⚠️ 메타마스크는 보안상 자동으로 여러 계정을 연결하지 않습니다. 위 과정을 통해 수동으로 연결해야만 페이지에서 사용할 수 있어요.
                    </p>
                </div>
            )}
        </div>
    );
};

export default MetamaskHelp;
