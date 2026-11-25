import { setFallbackAuthGateway } from "@/features/account/auth-gateway-context";
import { memoryAuthGateway } from "@/test/memory-auth-gateway";

// Component tests render screens alone, without the app's providers.
setFallbackAuthGateway(memoryAuthGateway);
