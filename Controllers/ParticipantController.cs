using Microsoft.AspNetCore.Mvc;

namespace EventManagerMVC.Controllers
{
    public class ParticipantController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
