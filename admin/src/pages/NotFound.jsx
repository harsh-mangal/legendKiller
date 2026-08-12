import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button, EmptyState } from "../components/ui";
export default function NotFound() { return <EmptyState icon={Compass} title="Admin page not found" description="The requested section does not exist or has moved." action={<Link to="/"><Button>Return to dashboard</Button></Link>} />; }
